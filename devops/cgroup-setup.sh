#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./provision_project.sh <PROJECT_NAME> <CPU_PERCENT> <MEMORY_MB> <STORAGE_LIMIT_GB> [COMPOSE_DIR]
# Example:
#   ./provision_project.sh v2-final 200 3072 20 /home/ubuntu/app/v2-final
#   ./provision_project.sh medium-plan 100 1024 10

PROJECT_NAME="${1:?PROJECT_NAME required}"
CPU_PERCENT_RAW="${2:?CPU percent required (e.g. 200 means 2 CPUs)}"
MEMORY_MB_RAW="${3:?Memory in MB required (e.g. 1024 means 1GB)}"
STORAGE_LIMIT_GB_RAW="${4:?Storage limit GB required (e.g. 20)}"
COMPOSE_DIR="${5:-/home/ubuntu/app/${PROJECT_NAME}}"

# ---- Validate & derive ----
if ! [[ "${CPU_PERCENT_RAW}" =~ ^[0-9]+$ ]]; then
  echo "CPU_PERCENT must be an integer like 200 (meaning 200%). Got: ${CPU_PERCENT_RAW}" >&2
  exit 1
fi
CPU_QUOTA="${CPU_PERCENT_RAW}%"

if ! [[ "${MEMORY_MB_RAW}" =~ ^[0-9]+$ ]]; then
  echo "MEMORY_MB must be an integer in MB. Got: ${MEMORY_MB_RAW}" >&2
  exit 1
fi
# Systemd accepts human units; use MB explicitly for clarity
MEMORY_MAX_STR="${MEMORY_MB_RAW}M"

if ! [[ "${STORAGE_LIMIT_GB_RAW}" =~ ^[0-9]+$ ]]; then
  echo "STORAGE_LIMIT_GB must be an integer in GB. Got: ${STORAGE_LIMIT_GB_RAW}" >&2
  exit 1
fi
STORAGE_LIMIT_GB="${STORAGE_LIMIT_GB_RAW}"

PG_IMG="/opt/${PROJECT_NAME}.pgfs"
PG_DIR="/opt/${PROJECT_NAME}/postgres-data"

echo "== Derived =="
echo "Project:            ${PROJECT_NAME}"
echo "Compose dir:        ${COMPOSE_DIR}"
echo "CPUQuota:           ${CPU_QUOTA}"
echo "MemoryMax:          ${MEMORY_MAX_STR}"
echo "Loop FS:            ${STORAGE_LIMIT_GB}G   ${PG_IMG}  ->  ${PG_DIR}"
echo

# ---- Pre-flight ----
if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH" >&2; exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose v2 not found (need 'docker compose')." >&2; exit 1
fi

sudo mkdir -p "${COMPOSE_DIR}"

# Enable controllers (cpu+memory) for cgroup v2 root (harmless if already set)
if [[ -w /sys/fs/cgroup/cgroup.subtree_control ]]; then
  echo "+cpu +memory" | sudo tee /sys/fs/cgroup/cgroup.subtree_control >/dev/null || true
fi

# ---- systemd slice (do NOT enable; services reference it via Slice=) ----
SLICE_UNIT_PATH="/etc/systemd/system/${PROJECT_NAME}.slice"
sudo tee "${SLICE_UNIT_PATH}" >/dev/null <<EOF
[Unit]
Description=Resource slice for project: ${PROJECT_NAME}

[Slice]
# Aggregate CPU/RAM caps for everything in this slice
CPUQuota=${CPU_QUOTA}
MemoryMax=${MEMORY_MAX_STR}
EOF
echo "Wrote slice: ${SLICE_UNIT_PATH}"

# ---- compose service (references the slice) ----
SERVICE_UNIT_PATH="/etc/systemd/system/${PROJECT_NAME}-compose.service"
sudo tee "${SERVICE_UNIT_PATH}" >/dev/null <<EOF
[Unit]
Description=Docker Compose stack: ${PROJECT_NAME}
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Slice=${PROJECT_NAME}.slice
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${COMPOSE_DIR}
Environment=COMPOSE_PROJECT_NAME=${PROJECT_NAME}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=no
TimeoutStartSec=0
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
echo "Wrote service: ${SERVICE_UNIT_PATH}"

# ---- loop-back storage for Postgres data ----
echo "Configuring loop-back FS at ${PG_IMG} mounted on ${PG_DIR} ..."
sudo systemctl stop "${PROJECT_NAME}-compose.service" || true

sudo mkdir -p "/opt/${PROJECT_NAME}" "${PG_DIR}"

# Ensure enough free space on /opt
OPT_MNT="$(findmnt -no SOURCE,TARGET -T /opt | awk '{print $2}')"
AVAIL_KB=$(df -Pk "${OPT_MNT:-/opt}" | awk 'NR==2{print $4}')
REQUIRED_KB=$(( STORAGE_LIMIT_GB * 1024 * 1024 ))
if (( AVAIL_KB < REQUIRED_KB )); then
  echo "ERROR: Not enough free space on ${OPT_MNT:-/opt}. Need ~${STORAGE_LIMIT_GB}G, available ~$(awk "BEGIN{printf \"%.2f\", ${AVAIL_KB}/1024/1024}")G" >&2
  exit 1
fi

# Create or grow image
if [[ ! -f "${PG_IMG}" ]]; then
  echo "Creating ${STORAGE_LIMIT_GB}G image file ${PG_IMG} ..."
  sudo fallocate -l "${STORAGE_LIMIT_GB}G" "${PG_IMG}"
else
  CURRENT_SIZE=$(stat -c%s "${PG_IMG}")
  TARGET_SIZE=$(( STORAGE_LIMIT_GB * 1024 * 1024 * 1024 ))
  if (( CURRENT_SIZE < TARGET_SIZE )); then
    echo "Growing image from $((CURRENT_SIZE/1024/1024/1024))G to ${STORAGE_LIMIT_GB}G ..."
    sudo truncate -s "${STORAGE_LIMIT_GB}G" "${PG_IMG}"
  else
    echo "Image ${PG_IMG} already >= ${STORAGE_LIMIT_GB}G"
  fi
fi

# Make ext4 filesystem if not already present
if ! sudo blkid "${PG_IMG}" >/dev/null 2>&1; then
  echo "Formatting ${PG_IMG} as ext4 ..."
  sudo mkfs.ext4 -F "${PG_IMG}"
fi

# fstab (idempotent)
FSTAB_LINE="${PG_IMG} ${PG_DIR} ext4 loop,defaults 0 0"
grep -qsF "${FSTAB_LINE}" /etc/fstab || echo "${FSTAB_LINE}" | sudo tee -a /etc/fstab >/dev/null

# Mount/remount
mountpoint -q "${PG_DIR}" && sudo umount "${PG_DIR}" || true
sudo mount "${PG_DIR}"

# postgres default uid/gid (999)
sudo chown -R 999:999 "${PG_DIR}"

# ---- Validate compose before enabling the unit (fail fast with clear error) ----
if [[ -f "${COMPOSE_DIR}/docker-compose.yml" || -f "${COMPOSE_DIR}/compose.yml" ]]; then
  ( cd "${COMPOSE_DIR}" && /usr/bin/docker compose config >/dev/null )
else
  echo "ERROR: No docker-compose.yml/compose.yml found in ${COMPOSE_DIR}" >&2
  exit 1
fi

# ---- reload & start ----
sudo systemctl daemon-reload
# NOTE: Do NOT enable the slice (it has no [Install] and doesn't need enabling)
sudo systemctl enable "${PROJECT_NAME}-compose.service" >/dev/null
sudo systemctl start "${PROJECT_NAME}-compose.service" || {
  echo "Service failed to start. Recent logs:" >&2
  sudo journalctl -xeu "${PROJECT_NAME}-compose.service" --no-pager | tail -n 200 >&2 || true
  exit 1
}

echo
echo "== Status =="
systemctl status --no-pager "${PROJECT_NAME}-compose.service" || true
echo "----------------------------------------"
systemctl show "${PROJECT_NAME}.slice" -p CPUQuota,MemoryMax,MemoryCurrent || true
echo "----------------------------------------"

# ---- storage checks ----
echo
echo "== Storage checks =="
du -sh "${PG_DIR}" || true
df -h "${PG_DIR}" || true

# If your Postgres container name is the default (<project>-postgres-1), show its view:
if docker ps --format '{{.Names}}' | grep -q "^${PROJECT_NAME}-postgres-1$"; then
  docker exec -it "${PROJECT_NAME}-postgres-1" df -h /var/lib/postgresql/data || true
else
  echo "Note: ${PROJECT_NAME}-postgres-1 not found (skipping container df)."
fi

echo "Done."
