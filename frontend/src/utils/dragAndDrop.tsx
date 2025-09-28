'use client';
import { usePathname } from 'next/navigation';
import {
  DragEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Pos {
  element: HTMLElement;
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
  id: string;
}
const GENERIC_CONTAINERS = [
  'div',
  'section',
  'article',
  'main',
  'aside',
  'header',
  'footer',
  'ul',
  'ol',
  'nav',
];

interface ElementAttributes {
  id: string;
  index: number;
  parentId?: string;
  path?: string;
  type: string;
  mode?: string;
  isNew: boolean;
  textContent: string;
  children: ElementAttributes[];
  attributes?: Record<string, any>;
  dataset?: Record<string, any>;
}

type Action = 'delete' | 'duplicate' | 'bring-forward' | 'send-backward';

export function DragAndDrop() {
  const params = usePathname();
  const activeElementRef = useRef<HTMLElement | null>(null);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const selectAbleElement = useRef<HTMLElement | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const currentTargetContainerRef = useRef<HTMLElement | null>(null);
  const activeElementPreviousContainer = useRef<HTMLElement | null>(null);
  const activeElementsAttributes = useRef<ElementAttributes[]>([]);
  const CLICK_THRESHOLD = 4;
  const DRAG_THRESHOLD = 5;
  const controlsRef = useRef<HTMLElement>(null);
  const controlsInitialized = useRef(false);

  const resizeWrapperRef = useRef<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const isResizingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const horizontalGuideRef = useRef<HTMLDivElement>(null);
  const verticalGuideRef = useRef<HTMLDivElement>(null);
  const centerCrosshairRef = useRef<HTMLDivElement>(null);
  const snapThreshold = 10;

  const distanceSpanRefs = useRef<{
    top?: HTMLDivElement;
    right?: HTMLDivElement;
    bottom?: HTMLDivElement;
    left?: HTMLDivElement;
  }>({});
  const alignmentLinesRef = useRef<{
    horizontal?: HTMLDivElement;
    vertical?: HTMLDivElement;
  }>({});

  const selectedElementsRef = useRef<HTMLElement[]>([]);
  const selectedElementsBackRef = useRef<HTMLElement[]>([]);
  const isSelectionDragging = useRef(false);
  const selectionStartPoint = useRef({ x: 0, y: 0 });
  const selectionRectRef = useRef<HTMLDivElement | null>(null);
  const [isMultiSelectKeyPressed, setIsMultiSelectKeyPressed] = useState(false);
  const isMultiSelectKeyPressedRef = useRef(false);

  // =========== Create Spans for Distance Display ================
  const createDistanceSpans = useCallback(() => {
    if (!distanceSpanRefs.current.top) {
      const directions = ['top', 'right', 'bottom', 'left'] as const;

      directions.forEach((dir) => {
        const span = document.createElement('div');
        span.className = `distance-span distance-span-${dir}`;
        span.style.position = 'fixed';
        span.style.zIndex = '9998';
        span.style.pointerEvents = 'none';
        span.style.display = 'none';

        const line = document.createElement('div');
        line.className = 'distance-line';
        line.style.position = 'absolute';
        line.style.backgroundColor = 'rgba(0, 150, 255, 0.9)';
        line.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';

        if (dir === 'top' || dir === 'bottom') {
          line.style.height = '2px';
          line.style.width = '100%';
        } else {
          line.style.width = '2px';
          line.style.height = '100%';
        }

        const label = document.createElement('div');
        label.className = 'distance-label';
        label.style.position = 'absolute';
        label.style.backgroundColor = 'rgba(0, 100, 255, 0.9)';
        label.style.color = 'white';
        label.style.padding = '3px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontFamily = 'sans-serif';
        label.style.fontWeight = 'bold';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';

        span.appendChild(line);
        span.appendChild(label);
        document.body.appendChild(span);
        distanceSpanRefs.current[dir] = span;
      });
    }
  }, []);

  const updateDistanceSpans = useCallback(
    (activeRect: DOMRect, siblings: Position[]) => {
      if (!distanceSpanRefs.current.top) return;
      Object.values(distanceSpanRefs.current).forEach((span) => {
        if (span) span.style.display = 'none';
      });
      const activeElement = activeElementRef.current;
      if (!activeElement) return;
      const activeStyles = window.getComputedStyle(activeElement);
      const activeMargin = {
        top: parseFloat(activeStyles.marginTop) || 0,
        bottom: parseFloat(activeStyles.marginBottom) || 0,
        left: parseFloat(activeStyles.marginLeft) || 0,
        right: parseFloat(activeStyles.marginRight) || 0,
      };
      const viewport = {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };

      const viewportDistances = {
        top: activeRect.top - viewport.top,
        bottom: viewport.bottom - activeRect.bottom,
        left: activeRect.left - viewport.left,
        right: viewport.right - activeRect.right,
      };

      showVerticalDistance(
        activeRect,
        {
          top: viewport.top,
          bottom: viewport.top,
          left: viewport.left,
          right: viewport.right,
          id: 'viewport-top',
        },
        'top',
        viewportDistances.top,
        0,
      );

      showVerticalDistance(
        activeRect,
        {
          top: viewport.bottom,
          bottom: viewport.bottom,
          left: viewport.left,
          right: viewport.right,
          id: 'viewport-bottom',
        },
        'bottom',
        viewportDistances.bottom,
        0,
      );

      showHorizontalDistance(
        activeRect,
        {
          top: viewport.top,
          bottom: viewport.bottom,
          left: viewport.left,
          right: viewport.left,
          id: 'viewport-left',
        },
        'left',
        viewportDistances.left,
        0,
      );

      showHorizontalDistance(
        activeRect,
        {
          top: viewport.top,
          bottom: viewport.bottom,
          left: viewport.right,
          right: viewport.right,
          id: 'viewport-right',
        },
        'right',
        viewportDistances.right,
        0,
      );
      siblings.forEach((sibling) => {
        const siblingElement = document.getElementById(sibling.id);
        if (!siblingElement) return;

        const siblingStyles = window.getComputedStyle(siblingElement);
        const siblingMargin = {
          top: parseFloat(siblingStyles.marginTop) || 0,
          bottom: parseFloat(siblingStyles.marginBottom) || 0,
          left: parseFloat(siblingStyles.marginLeft) || 0,
          right: parseFloat(siblingStyles.marginRight) || 0,
        };

        const distances = {
          topToBottom: activeRect.top - sibling.bottom,
          bottomToTop: sibling.top - activeRect.bottom,
          leftToRight: activeRect.left - sibling.right,
          rightToLeft: sibling.left - activeRect.right,
          topOverlap: sibling.top - activeRect.top,
          bottomOverlap: activeRect.bottom - sibling.bottom,
          leftOverlap: sibling.left - activeRect.left,
          rightOverlap: activeRect.right - sibling.right,
        };

        const isTopAligned = Math.abs(activeRect.top - sibling.top) < 1;
        const isBottomAligned =
          Math.abs(activeRect.bottom - sibling.bottom) < 1;
        const isLeftAligned = Math.abs(activeRect.left - sibling.left) < 1;
        const isRightAligned = Math.abs(activeRect.right - sibling.right) < 1;
        if (distances.topToBottom >= 0) {
          showVerticalDistance(
            activeRect,
            sibling,
            'top',
            distances.topToBottom,
            activeMargin.top + siblingMargin.bottom,
          );
        } else if (distances.bottomToTop >= 0) {
          showVerticalDistance(
            activeRect,
            sibling,
            'bottom',
            distances.bottomToTop,
            activeMargin.bottom + siblingMargin.top,
          );
        } else if (
          distances.topOverlap > 0 &&
          distances.topOverlap < activeRect.height
        ) {
          showVerticalDistance(
            activeRect,
            sibling,
            'top',
            distances.topOverlap,
            activeMargin.top + siblingMargin.top,
            true,
          );
        } else if (
          distances.bottomOverlap > 0 &&
          distances.bottomOverlap < activeRect.height
        ) {
          showVerticalDistance(
            activeRect,
            sibling,
            'bottom',
            distances.bottomOverlap,
            activeMargin.bottom + siblingMargin.bottom,
            true,
          );
        }

        if (distances.leftToRight >= 0) {
          showHorizontalDistance(
            activeRect,
            sibling,
            'left',
            distances.leftToRight,
            activeMargin.left + siblingMargin.right,
          );
        } else if (distances.rightToLeft >= 0) {
          showHorizontalDistance(
            activeRect,
            sibling,
            'right',
            distances.rightToLeft,
            activeMargin.right + siblingMargin.left,
          );
        } else if (
          distances.leftOverlap > 0 &&
          distances.leftOverlap < activeRect.width
        ) {
          showHorizontalDistance(
            activeRect,
            sibling,
            'left',
            distances.leftOverlap,
            activeMargin.left + siblingMargin.left,
            true,
          );
        } else if (
          distances.rightOverlap > 0 &&
          distances.rightOverlap < activeRect.width
        ) {
          showHorizontalDistance(
            activeRect,
            sibling,
            'right',
            distances.rightOverlap,
            activeMargin.right + siblingMargin.right,
            true,
          );
        }
        if (isTopAligned) showAlignment(activeRect, sibling, 'top');
        if (isBottomAligned) showAlignment(activeRect, sibling, 'bottom');
        if (isLeftAligned) showAlignment(activeRect, sibling, 'left');
        if (isRightAligned) showAlignment(activeRect, sibling, 'right');
      });
    },
    [],
  );

  // ========= show alignment =======
  const showAlignment = (
    active: DOMRect,
    sibling: Position,
    edge: 'top' | 'bottom' | 'left' | 'right',
  ) => {
    const existingHorizontal = alignmentLinesRef.current.horizontal;
    const existingVertical = alignmentLinesRef.current.vertical;
    if (edge === 'top' || edge === 'bottom') {
      const y = edge === 'top' ? active.top : active.bottom;
      if (
        !existingHorizontal ||
        parseFloat(existingHorizontal.style.top) !== y
      ) {
        if (existingHorizontal) existingHorizontal.remove();
        const span = document.createElement('div');
        span.className = `alignment-line alignment-${edge}`;
        span.style.position = 'fixed';
        span.style.zIndex = '9999';
        span.style.backgroundColor = 'rgba(255, 50, 50, 0.7)';
        span.style.left = '0';
        span.style.top = `${y}px`;
        span.style.width = '100vw';
        span.style.height = '1px';
        alignmentLinesRef.current.horizontal = span;
        document.body.appendChild(span);
      }
    } else {
      const x = edge === 'left' ? active.left : active.right;

      if (!existingVertical || parseFloat(existingVertical.style.left) !== x) {
        if (existingVertical) existingVertical.remove();
        const span = document.createElement('div');
        span.className = `alignment-line alignment-${edge}`;
        span.style.position = 'fixed';
        span.style.zIndex = '9999';
        span.style.backgroundColor = 'rgba(255, 50, 50, 0.7)';
        span.style.left = `${x}px`;
        span.style.top = '0';
        span.style.width = '1px';
        span.style.height = '100vh';
        alignmentLinesRef.current.vertical = span;
        document.body.appendChild(span);
      }
    }
  };

  // === Show Vertical Distance (full line from element to reference) ===
  const showVerticalDistance = (
    active: DOMRect,
    sibling: Position,
    edge: 'top' | 'bottom',
    distance: number,
    totalMargin: number,
    isOverlap: boolean = false,
  ) => {
    const span = distanceSpanRefs.current[edge];
    if (!span) return;

    const isTop = edge === 'top';
    const startY = isTop ? sibling.bottom : active.bottom;
    const endY = isTop ? active.top : sibling.top;
    const xPos = active.left + active.width / 2;

    span.style.display = 'block';
    span.style.left = `${xPos}px`;
    span.style.top = `${startY}px`;
    span.style.width = '0';
    span.style.height = `${endY - startY}px`;
    span.style.transform = 'translateX(-50%)';

    const line = span.querySelector('.distance-line') as HTMLElement;
    const label = span.querySelector('.distance-label') as HTMLElement;

    if (line) {
      line.style.width = '2px';
      line.style.height = '100%';
      line.style.left = '0';
      line.style.top = '0';
      line.style.backgroundColor = isOverlap
        ? 'rgba(255, 100, 100, 0.9)'
        : totalMargin > 0
          ? 'rgba(0, 200, 100, 0.9)'
          : 'rgba(0, 150, 255, 0.9)';
    }

    if (label) {
      label.textContent = isOverlap
        ? `Overlap: ${Math.round(distance)}px`
        : `${Math.round(distance)}px${
            totalMargin > 0 ? ` (${Math.round(totalMargin)}px)` : ''
          }`;

      label.style.left = '50%';
      label.style.top = '50%';
      label.style.transform = 'translate(-50%, -50%)';
      label.style.backgroundColor = isOverlap
        ? 'rgba(200, 50, 50, 0.9)'
        : totalMargin > 0
          ? 'rgba(0, 160, 80, 0.9)'
          : 'rgba(0, 100, 255, 0.9)';
    }
  };

  // ======= Show Horizontal Distance (full line from element to reference) =======
  const showHorizontalDistance = (
    active: DOMRect,
    sibling: Position,
    edge: 'left' | 'right',
    distance: number,
    totalMargin: number,
    isOverlap: boolean = false,
  ) => {
    const span = distanceSpanRefs.current[edge];
    if (!span) return;

    const isLeft = edge === 'left';
    const startX = isLeft ? sibling.right : active.right;
    const endX = isLeft ? active.left : sibling.left;
    const yPos = active.top + active.height / 2;

    span.style.display = 'block';
    span.style.left = `${startX}px`;
    span.style.top = `${yPos}px`;
    span.style.width = `${endX - startX}px`;
    span.style.height = '0';
    span.style.transform = 'translateY(-50%)';

    const line = span.querySelector('.distance-line') as HTMLElement;
    const label = span.querySelector('.distance-label') as HTMLElement;

    if (line) {
      line.style.width = '100%';
      line.style.height = '2px';
      line.style.left = '0';
      line.style.top = '0';
      line.style.backgroundColor = isOverlap
        ? 'rgba(255, 100, 100, 0.9)'
        : totalMargin > 0
          ? 'rgba(0, 200, 100, 0.9)'
          : 'rgba(0, 150, 255, 0.9)';
    }

    if (label) {
      label.textContent = isOverlap
        ? `Overlap: ${Math.round(distance)}px`
        : `${Math.round(distance)}px${
            totalMargin > 0 ? ` (${Math.round(totalMargin)}px)` : ''
          }`;

      label.style.left = '50%';
      label.style.top = '50%';
      label.style.transform = 'translate(-50%, -50%)';
      label.style.backgroundColor = isOverlap
        ? 'rgba(200, 50, 50, 0.9)'
        : totalMargin > 0
          ? 'rgba(0, 160, 80, 0.9)'
          : 'rgba(0, 100, 255, 0.9)';
    }
  };

  // ============ create control panel ========
  const createControlPanel = useCallback(() => {
    if (controlsRef.current) return controlsRef.current;

    const buttons = [
      {
        id: 'delete',
        label: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
        title: 'Delete',
      },
      {
        id: 'duplicate',
        label: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>`,
        title: 'Duplicate',
      },
      {
        id: 'bring-forward',
        label: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2"/><path d="M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"/></svg>`,
        title: 'Bring Forward',
      },
      {
        id: 'send-backward',
        label: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-to-back-icon lucide-send-to-back"><rect x="14" y="14" width="8" height="8" rx="2"/><rect x="2" y="2" width="8" height="8" rx="2"/><path d="M7 14v1a2 2 0 0 0 2 2h1"/><path d="M14 7h1a2 2 0 0 1 2 2v1"/></svg>`,
        title: 'Send Backward',
      },
      {
        id: 'ai-prompt',
        label: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles-icon lucide-wand-sparkles"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>`,
        title: 'AI',
      },
    ] as const;

    const panel = document.createElement('div');
    panel.className = 'element-control-panel';

    panel.style.display = 'none';
    panel.style.position = 'absolute';
    panel.style.zIndex = '999999';
    panel.style.pointerEvents = 'auto';
    panel.style.backgroundColor = 'white';
    panel.style.borderRadius = '4px';
    panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    panel.style.height = '50px';
    panel.style.padding = '0 0px';
    panel.style.gap = '8px';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'center';
    panel.style.display = 'flex';
    ['pointerdown', 'mousedown', 'click'].forEach((evt) => {
      panel.addEventListener(evt, (e) => {
        e.stopPropagation();
      });
    });
    const aiPromptContainer = document.createElement('div');
    aiPromptContainer.className = 'ai-prompt-container';
    aiPromptContainer.style.display = 'none';
    aiPromptContainer.style.position = 'absolute';
    aiPromptContainer.style.left = '100%';
    aiPromptContainer.style.top = '0';
    aiPromptContainer.style.marginLeft = '8px';
    aiPromptContainer.style.backgroundColor = 'white';
    aiPromptContainer.style.borderRadius = '4px';
    aiPromptContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    aiPromptContainer.style.padding = '12px';
    aiPromptContainer.style.width = '300px';
    aiPromptContainer.style.zIndex = '1000000';

    ['pointerdown', 'mousedown', 'click'].forEach((evt) => {
      aiPromptContainer.addEventListener(evt, (e) => e.stopPropagation());
    });

    const aiTextarea = document.createElement('textarea');
    aiTextarea.placeholder = 'what do want to change...';
    aiTextarea.style.width = '100%';
    aiTextarea.style.minHeight = '100px';
    aiTextarea.style.marginBottom = '12px';
    aiTextarea.style.border = '1px solid #1F883D';
    aiTextarea.style.borderRadius = '4px';
    aiTextarea.style.padding = '8px';
    aiTextarea.style.fontSize = '16px';

    const aiSendButton = document.createElement('button');
    aiSendButton.type = 'button';
    aiSendButton.innerHTML = `Send`;
    aiSendButton.style.display = 'flex';
    aiSendButton.style.alignItems = 'center';
    aiSendButton.style.justifyContent = 'center';
    aiSendButton.style.gap = '4px';
    aiSendButton.style.width = '100%';
    aiSendButton.style.padding = '8px';
    aiSendButton.style.background = '#1f883d';
    aiSendButton.style.color = 'white';
    aiSendButton.style.border = 'none';
    aiSendButton.style.borderRadius = '4px';
    aiSendButton.style.cursor = 'pointer';
    aiSendButton.style.fontWeight = '500';
    aiSendButton.style.transition = 'all 0.2s';

    aiSendButton.addEventListener('mouseenter', () => {
      aiSendButton.style.background = '#166f2e';
    });
    aiSendButton.addEventListener('mouseleave', () => {
      aiSendButton.style.background = '#1f883d';
    });

    aiSendButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    aiSendButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (selectedElementRef.current) {
        try {
          window.parent.document.dispatchEvent(
            new CustomEvent('AI_PROMPT_SUBMITTED', {
              detail: {
                prompt: aiTextarea.value,
                id: selectedElementRef.current.id,
                path: params,
              },
            }),
          );
          aiSendButton.innerText = 'Processing .... ';
          aiTextarea.value = '';
        } finally {
        }
      }
    });

    aiPromptContainer.appendChild(aiTextarea);
    aiPromptContainer.appendChild(aiSendButton);
    panel.appendChild(aiPromptContainer);

    const tooltip = document.createElement('div');
    tooltip.className = 'control-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#0a970a';
    tooltip.style.color = 'white';
    tooltip.style.padding = '4px 8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '16px';
    tooltip.style.fontWeight = '600';
    tooltip.style.zIndex = '1000001';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    buttons.forEach((button) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'control-btn';
      btn.dataset.action = button.id;
      btn.innerHTML = button.label;
      btn.title = button.title;
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.padding = '0 12px';
      btn.style.cursor = 'pointer';
      btn.style.height = '100%';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.transition = 'all 0.2s';
      btn.style.position = 'relative';

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#f0f0f0';
        tooltip.textContent = button.title;
        tooltip.style.display = 'block';
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = `${
          rect.left + rect.width / 2 - tooltip.offsetWidth / 2
        }px`;

        tooltip.style.top = `${rect.top - 40}px`;
      });

      btn.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        btn.style.background = 'none';
        btn.style.transform = 'scale(1)';
      });

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.style.background = '#e0e0e0';
        btn.style.transform = 'scale(0.95)';
      });

      btn.addEventListener('pointerup', () => {
        btn.style.transform = 'scale(1)';
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (button.id === 'ai-prompt') {
          aiPromptContainer.style.display =
            aiPromptContainer.style.display === 'none' ? 'block' : 'none';
          return;
        }
        latestHandlersRef.current.handleControlClick(
          e as globalThis.MouseEvent,
          button.id as unknown as Action,
        );
      });

      panel.appendChild(btn);
    });

    document.body.appendChild(panel);
    controlsRef.current = panel;
    return panel;
  }, []);

  // ============== Show Controls ==============
  const showControls = useCallback(
    (element: HTMLElement) => {
      const panel = createControlPanel();
      if (!panel || !element) return;

      const rect = element.getBoundingClientRect();
      const panelHeight = 70;
      const panelWidth = panel.offsetWidth;

      let top = rect.top - panelHeight - 10;
      let left = rect.left + rect.width / 2 - panelWidth / 2;

      if (left < 10) left = 10;
      if (left + panelWidth > window.innerWidth - 10) {
        left = window.innerWidth - panelWidth - 10;
      }
      if (top < 10) top = rect.bottom + 10;

      panel.style.display = 'flex';
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;

      selectedElementRef.current = element;
      if (resizeWrapperRef.current) {
        resizeWrapperRef.current.style.display = 'block';
        resizeWrapperRef.current.style.top = `${rect.top}px`;
        resizeWrapperRef.current.style.left = `${rect.left}px`;
        resizeWrapperRef.current.style.width = `${rect.width}px`;
        resizeWrapperRef.current.style.height = `${rect.height}px`;
      }
    },
    [createControlPanel],
  );

  // ================= Resize Handles Management =================
  const createResizeWrapper = useCallback(() => {
    if (resizeWrapperRef.current) return resizeWrapperRef.current;
    const wrapper = document.createElement('div');
    wrapper.className = 'resize-handles-wrapper';
    wrapper.id = 'resize-handles-wrapper';
    wrapper.style.display = 'none';
    wrapper.style.position = 'absolute';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '1000';

    const directions = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
    directions.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${dir}`;
      handle.addEventListener('mousedown', (e: globalThis.MouseEvent) => {
        e.stopPropagation();
        initResize(e, dir);
      });
      wrapper.appendChild(handle);
    });

    document.body.appendChild(wrapper);
    resizeWrapperRef.current = wrapper;
    return wrapper;
  }, []);

  // ================   show resize handler method  =======================
  const showResizeHandles = useCallback(
    (element: HTMLElement) => {
      const wrapper = createResizeWrapper();
      if (!wrapper) return;
      const rect = element.getBoundingClientRect();
      wrapper.style.display = 'block';
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.height = `${rect.height}px`;
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.left = `${rect.left}px`;
      selectedElementRef.current = element;
    },
    [createResizeWrapper],
  );

  // ============== hide resize handler Method ================
  const hideResizeHandles = useCallback(() => {
    if (resizeWrapperRef.current) {
      resizeWrapperRef.current.style.display = 'none';
    }
    selectedElementRef.current = null;
    selectedElementsRef.current = [];
  }, []);

  // ============== Hide Controls ==============
  const hideControls = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.style.display = 'none';
    }
    selectedElementRef.current = null;
    document.querySelectorAll('.selected-element').forEach((el) => {
      el.classList.remove('selected-element');
    });

    document.querySelectorAll('.hover-element').forEach((el) => {
      el.classList.remove('hover-element');
    });
    hideResizeHandles();
  }, [hideResizeHandles]);

  // =============== init resizing ================
  const initResize = useCallback(
    (e: globalThis.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = true;
      const element = selectedElementRef.current;
      if (!element) return;

      const parent = element.parentElement;
      if (!parent) return;

      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      const originalStyles = {
        width: element.style.width,
        height: element.style.height,
        opacity: element.style.opacity,
        left: element.style.left,
        top: element.style.top,
      };

      const relativeLeft = element.offsetLeft;
      const relativeTop = element.offsetTop;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = element.offsetWidth;
      const startHeight = element.offsetHeight;
      const startLeft = relativeLeft;
      const startTop = relativeTop;

      const ghost = element.cloneNode(true) as HTMLElement;
      ghost.style.position = 'absolute';
      ghost.style.left = `${relativeLeft}px`;
      ghost.style.top = `${relativeTop}px`;
      ghost.style.width = `${startWidth}px`;
      ghost.style.height = `${startHeight}px`;
      ghost.style.boxSizing = 'border-box';
      ghost.style.margin = '0';
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.6';
      ghost.style.zIndex = '9999';
      ghost.style.visibility = 'visible';

      element.parentNode?.insertBefore(ghost, element.nextSibling);

      element.style.opacity = '0';

      let animationFrameId: number | null = null;

      const doResize = (moveEvent: globalThis.MouseEvent) => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        hideControls();
        animationFrameId = requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;

          switch (direction) {
            case 'e':
              newWidth = Math.max(startWidth + deltaX, 20);
              break;

            case 'w':
              newWidth = Math.max(startWidth - deltaX, 20);
              newLeft = startLeft + deltaX;
              break;

            case 's':
              newHeight = Math.max(startHeight + deltaY, 20);
              break;

            case 'n':
              newHeight = Math.max(startHeight - deltaY, 20);
              newTop = startTop + deltaY;
              break;

            case 'ne':
              newWidth = Math.max(startWidth + deltaX, 20);
              newHeight = Math.max(startHeight - deltaY, 20);
              newTop = startTop + deltaY;
              break;

            case 'nw':
              newWidth = Math.max(startWidth - deltaX, 20);
              newHeight = Math.max(startHeight - deltaY, 20);
              newLeft = startLeft + deltaX;
              newTop = startTop + deltaY;
              break;

            case 'se':
              newWidth = Math.max(startWidth + deltaX, 20);
              newHeight = Math.max(startHeight + deltaY, 20);
              break;

            case 'sw':
              newWidth = Math.max(startWidth - deltaX, 20);
              newHeight = Math.max(startHeight + deltaY, 20);
              newLeft = startLeft + deltaX;
              break;
          }

          ghost.style.width = `${newWidth}px`;
          ghost.style.height = `${newHeight}px`;
          ghost.style.left = `${newLeft}px`;
          ghost.style.top = `${newTop}px`;

          animationFrameId = null;
        });
      };

      const stopResize = () => {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        isResizingRef.current = false;

        element.style.width = ghost.style.width;
        element.style.height = ghost.style.height;
        element.style.left = ghost.style.left;
        element.style.top = ghost.style.top;

        element.style.opacity = originalStyles.opacity || '1';

        ghost.remove();

        if (element.id && activeElementsAttributes.current) {
          updateElementAttributes(element);
          showControls(element);
          showResizeHandles(element);
        }
      };

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    },
    [showControls, showResizeHandles, hideControls],
  );

  // ========= helper method to get body scale =======
  const getBodyScale = useCallback(() => {
    const bodyStyle = getComputedStyle(document.body);
    const matrix = new DOMMatrix(bodyStyle.transform);
    return {
      scaleX: matrix.a || 1,
      scaleY: matrix.d || 1,
    };
  }, []);

  // ============== Handle AI Prompt ==============
  const aiPrompt = '';
  const handleAiPrompt = useCallback(async () => {
    if (!selectedElementRef.current) return;
    try {
      window.parent.document.dispatchEvent(
        new CustomEvent('AI_PROMPT_SUBMITTED', {
          detail: {
            prompt: aiPrompt,
            elementId: selectedElementRef.current.id,
            elementPath: params,
          },
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (selectedElementRef.current) {
        selectedElementRef.current.textContent = `AI: ${aiPrompt}`;
      }
    } finally {
    }
  }, [aiPrompt]);

  const createSelectionRectangle = useCallback(() => {
    if (selectionRectRef.current) return selectionRectRef.current;

    const rect = document.createElement('div');
    rect.className = 'selection-rectangle';
    rect.style.position = 'fixed';
    rect.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
    rect.style.border = '2px solid rgba(66, 153, 225, 0.8)';
    rect.style.borderRadius = '4px';
    rect.style.pointerEvents = 'none';
    rect.style.zIndex = '9990';
    rect.style.display = 'none';

    document.body.appendChild(rect);
    selectionRectRef.current = rect;
    return rect;
  }, []);

  // ============ UPDATE SELECTION RECTANGLE ============
  const updateSelectionRectangle = useCallback(
    (startX: number, startY: number, currentX: number, currentY: number) => {
      const rect = createSelectionRectangle();
      if (!rect) return;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      rect.style.left = `${left}px`;
      rect.style.top = `${top}px`;
      rect.style.width = `${width}px`;
      rect.style.height = `${height}px`;
      rect.style.display = 'block';
    },
    [createSelectionRectangle],
  );

  // ============ HIDE SELECTION RECTANGLE ============
  const hideSelectionRectangle = useCallback(() => {
    if (selectionRectRef.current) {
      selectionRectRef.current.style.display = 'none';
    }
    isSelectionDragging.current = false;
  }, []);

  // ============ CLEAR SELECTION ============
  const clearSelection = useCallback(() => {
    selectedElementsRef.current.forEach((element) => {
      element.classList.remove('selected-element');
    });
    selectedElementsRef.current = [];
    selectedElementRef.current = null;
    hideControls();
  }, [hideControls]);

  // ============ ADD TO SELECTION ============
  const addToSelection = useCallback((element: HTMLElement) => {
    if (selectedElementsRef.current.includes(element)) return;
    selectedElementsRef.current = [...selectedElementsRef.current, element];
    element.classList.add('selected-element');
    selectedElementRef.current = element;
  }, []);

  // ============ REMOVE FROM SELECTION ============
  const removeFromSelection = useCallback((element: HTMLElement) => {
    if (!selectedElementsRef.current.includes(element)) return;

    selectedElementsRef.current = selectedElementsRef.current.filter(
      (el) => el !== element,
    );
    element.classList.remove('selected-element');

    if (selectedElementRef.current === element) {
      selectedElementRef.current =
        selectedElementsRef.current.length > 0
          ? selectedElementsRef.current[selectedElementsRef.current.length - 1]
          : null;
    }
  }, []);

  // ============ TOGGLE SELECTION ============
  const toggleSelection = useCallback(
    (element: HTMLElement) => {
      if (selectedElementsRef.current.includes(element)) {
        removeFromSelection(element);
      } else {
        addToSelection(element);
      }
    },
    [addToSelection, removeFromSelection],
  );

  // Helper type for compatibility with plain rect objects or DOMRect
  type RectLike =
    | {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width?: number;
        height?: number;
      }
    | DOMRect;

  // ========== showControlsForMultiple (fixed) ==========
  const showControlsForMultiple = useCallback(
    (elements: HTMLElement[] = selectedElementsRef.current) => {
      const visibleElements = elements.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      if (!visibleElements.length) {
        hideControls();
        return;
      }

      selectedElementsBackRef.current = elements;

      const panel = createControlPanel();
      const wrapper = createResizeWrapper();
      if (!panel || !wrapper) return;

      document.body.append(panel, wrapper);
      panel.style.position = wrapper.style.position = 'fixed';

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      visibleElements.forEach((el) => {
        const r = el.getBoundingClientRect();
        minX = Math.min(minX, r.left);
        minY = Math.min(minY, r.top);
        maxX = Math.max(maxX, r.right);
        maxY = Math.max(maxY, r.bottom);
      });
      Object.assign(wrapper.style, {
        display: 'block',
        left: `${minX - 8}px`,
        top: `${minY - 8}px`,
        width: `${maxX - minX + 16}px`,
        height: `${maxY - minY + 16}px`,
        zIndex: '10000',
      });
      resizeWrapperRef.current = wrapper;
    },
    [createControlPanel, createResizeWrapper, hideControls],
  );

  const selectElementsInRectangle = useCallback(
    (rectInput: RectLike, options?: { add?: boolean }) => {
      const rect =
        'left' in rectInput && typeof (rectInput as any).left === 'number'
          ? (rectInput as RectLike)
          : (rectInput as DOMRect);

      const add = options?.add ?? !!isMultiSelectKeyPressedRef.current;

      const selectableElements = document.querySelectorAll(
        SELECTABLE_SELECTOR,
      ) as NodeListOf<HTMLElement>;
      const newlySelected: HTMLElement[] = [];

      selectableElements.forEach((element) => {
        if (
          !element.offsetParent &&
          getComputedStyle(element).position === 'static'
        ) {
        }
        const r = element.getBoundingClientRect();
        const isIntersecting = !(
          r.right < (rect as any).left ||
          r.left > (rect as any).right ||
          r.bottom < (rect as any).top ||
          r.top > (rect as any).bottom
        );

        if (isIntersecting) newlySelected.push(element);
      });
      if (!add) {
        clearSelection();
      }
      for (const element of newlySelected) {
        if (!selectedElementsRef.current.includes(element)) {
          element.classList.add('selected-element');
          selectedElementsRef.current.push(element);
        }
      }
      if (selectedElementsRef.current.length > 0) {
        activeElementRef.current =
          selectedElementsRef.current[selectedElementsRef.current.length - 1];
        showControlsForMultiple(selectedElementsRef.current);
      } else {
        hideControls();
      }
    },
    [clearSelection, showControlsForMultiple, hideControls],
  );

  const handleControlClick = useCallback(
    (e: globalThis.MouseEvent, action: Action) => {
      e.stopPropagation();
      e.preventDefault();
      selectedElementsRef.current.forEach((element) => {
        if (!element || !document.contains(element)) return;

        const dispatchToParent = (
          type: string,
          detail: Record<string, string>,
        ) => {
          try {
            window.parent?.document?.dispatchEvent(
              new CustomEvent(type, { detail }),
            );
          } catch (err) {
            console.warn('Could not dispatch event to parent:', err);
          }
        };

        const numericStyleValue = (
          el: Element,
          prop: 'left' | 'top' | 'zIndex',
        ) => {
          const cs = window.getComputedStyle(el as Element);
          const raw =
            (prop === 'zIndex'
              ? cs.zIndex
              : prop === 'left'
                ? cs.left
                : cs.top) || '';
          const v = parseFloat(raw as string);
          if (!Number.isFinite(v)) {
            if (prop === 'left')
              return (element as HTMLElement).offsetLeft ?? 0;
            if (prop === 'top') return (element as HTMLElement).offsetTop ?? 0;
            return 0;
          }
          return v;
        };

        switch (action) {
          case 'delete': {
            const deletedElement = element;
            deletedElement.dataset.deletedElement = 'true';
            updateElementAttributes(deletedElement);
            deletedElement.remove();
            break;
          }

          case 'duplicate': {
            const clone = element.cloneNode(true) as HTMLElement;
            clone.id = `${element.tagName
              .toLocaleLowerCase()
              .slice(0, 2)}-${Date.now().toString()}`;
            const originalComputed = window.getComputedStyle(element);
            clone.style.marginLeft = `${parseInt(
              originalComputed.marginLeft,
            )}px`;
            clone.style.top = `${parseInt(originalComputed.marginLeft) + 20}px`;
            try {
              const parentNode = element.parentNode as HTMLElement | null;
              if (!parentNode)
                throw new Error(
                  'Original element has no parent to insert into.',
                );
              const elementAbsolutePos = getAbsolutePositions(
                element.parentElement,
                true,
              );
              parentNode.insertBefore(clone, element.nextSibling);
              const parent = element.parentElement;
              const children = parent?.children;
              const containerRect =
                element.parentElement?.getBoundingClientRect();
              if (!children || !containerRect) return;
              arrangeAllElements(
                elementAbsolutePos,
                children,
                containerRect,
                parent,
              );
              const parentElement = clone.parentElement;
              const childrenArray = Array.from(parentElement?.children ?? []);
              const index = childrenArray.indexOf(clone);
              const parentId = parentElement?.id ?? '';
              const newAttributes: ElementAttributes = {
                id: clone.id,
                index,
                parentId,
                type: clone.tagName.toLowerCase(),
                path: params,
                isNew: true,
                attributes: {},
                dataset: { ...(clone.dataset ?? {}) },
                textContent: clone.textContent ?? '',
                children: [],
              };

              activeElementsAttributes.current = [
                ...(activeElementsAttributes.current ?? []),
                newAttributes,
              ];

              dispatchToParent('ELEMENT_DUPLICATED', {
                originalId: element.id,
                id: clone.id,
                parentId,
                path: params,
              });
            } catch (error) {
              console.error('Failed to insert duplicate element:', error);
            }
            break;
          }

          case 'bring-forward': {
            const currentZ = numericStyleValue(element, 'zIndex');
            const newZ = currentZ + 1;
            element.style.zIndex = `${newZ}`;
          }

          case 'send-backward': {
            const currentZ = numericStyleValue(element, 'zIndex');
            const newZ = Math.max(0, currentZ - 1);
            element.style.zIndex = `${newZ}`;
            break;
          }
        }
      });

      selectedElementsRef.current = selectedElementsRef.current.filter((el) =>
        document.contains(el),
      );

      if (selectedElementsRef.current.length === 0) {
        selectedElementRef.current = null;
        hideControls();
      } else {
        selectedElementRef.current =
          selectedElementsRef.current[selectedElementsRef.current.length - 1];
        showControlsForMultiple();
      }
    },
    [hideControls, showControlsForMultiple, params],
  );

  //=============================== flex & grid ==================================================
  const styleCache = new WeakMap<HTMLElement, CSSStyleDeclaration>();

  const initalPlaceholderRef = useRef<HTMLElement | null>(null);
  function getOrCreatePlaceholder(doc: Document = document): HTMLElement {
    if (!initalPlaceholderRef.current) {
      const ph = doc.createElement('div');
      ph.id = 'drop-placeholder';
      Object.assign(ph.style, {
        position: 'relative',
        pointerEvents: 'none',
        background: 'rgba(0, 128, 0, 0.5)',
        borderRadius: '4px',
        transition: 'all 120ms ease',
        minHeight: '4px',
        minWidth: '4px',
        zIndex: '9999',
      });

      initalPlaceholderRef.current = ph;
    }
    return initalPlaceholderRef.current;
  }

  //   // ======================= UNIVERSAL DROP POSITION CALCULATION ====================
  // const getInsertDropPosition = useCallback(
  //   (
  //     container: HTMLElement,
  //     clientX: number,
  //     clientY: number,
  //   ): HTMLElement | null => {
  //     if (!container) return null;

  //     const containerRect = container.getBoundingClientRect();
  //     const containerStyle = getComputedStyle(container);
  //     const display = containerStyle.display;
  //     const isFlex = display.includes('flex');
  //     const isGrid = display.includes('grid');

  //     // Collect visible, non-placeholder children
  //     const children = Array.from(container.children).filter(
  //       (el): el is HTMLElement =>
  //         el.nodeType === 1 &&
  //         el.id !== 'drop-placeholder' &&
  //         el.offsetWidth > 0 &&
  //         el.offsetHeight > 0,
  //     );

  //     // If no children, allow drop anywhere → append
  //     if (children.length === 0) {
  //       return null;
  //     }

  //     const childData = children.map((child) => ({
  //       el: child,
  //       rect: child.getBoundingClientRect(),
  //     }));

  //     const containerCenterX = (containerRect.left + containerRect.right) / 2;
  //     const containerCenterY = (containerRect.top + containerRect.bottom) / 2;

  //     if (isFlex) {
  //       const flexDirection = containerStyle.flexDirection;
  //       const isRow = flexDirection.startsWith('row');
  //       const isReversed = flexDirection.endsWith('reverse');

  //       // Sort children in visual order
  //       childData.sort((a, b) => {
  //         if (isRow) {
  //           return isReversed
  //             ? b.rect.right - a.rect.right
  //             : a.rect.left - b.rect.left;
  //         } else {
  //           return isReversed
  //             ? b.rect.bottom - a.rect.bottom
  //             : a.rect.top - b.rect.top;
  //         }
  //       });

  //       let bestGapIndex = 0;
  //       let minDist = Infinity;

  //       // Evaluate N+1 possible drop gaps
  //       for (let i = 0; i <= childData.length; i++) {
  //         let gapX = 0;
  //         let gapY = 0;

  //         if (i === 0) {
  //           // Before first child
  //           const first = childData[0].rect;
  //           if (isRow) {
  //             gapX = first.left;
  //             gapY = containerCenterY;
  //           } else {
  //             gapY = first.top;
  //             gapX = containerCenterX;
  //           }
  //         } else if (i === childData.length) {
  //           // After last child
  //           const last = childData[childData.length - 1].rect;
  //           if (isRow) {
  //             gapX = last.right;
  //             gapY = containerCenterY;
  //           } else {
  //             gapY = last.bottom;
  //             gapX = containerCenterX;
  //           }
  //         } else {
  //           // Between child[i-1] and child[i]
  //           const prev = childData[i - 1].rect;
  //           const next = childData[i].rect;
  //           if (isRow) {
  //             gapX = (prev.right + next.left) / 2;
  //             gapY = containerCenterY;
  //           } else {
  //             gapY = (prev.bottom + next.top) / 2;
  //             gapX = containerCenterX;
  //           }
  //         }

  //         // Use only the relevant axis for distance
  //         const dist = isRow
  //           ? Math.abs(gapX - clientX)
  //           : Math.abs(gapY - clientY);

  //         if (dist < minDist) {
  //           minDist = dist;
  //           bestGapIndex = i;
  //         }
  //       }

  //       return bestGapIndex < childData.length
  //         ? childData[bestGapIndex].el
  //         : null;
  //     } else if (isGrid) {
  //       const gridTemplateColumns = containerStyle.gridTemplateColumns.trim();
  //       const gridTemplateRows = containerStyle.gridTemplateRows.trim();

  //       const isSingleRow =
  //         gridTemplateRows !== '' &&
  //         gridTemplateRows !== 'auto' &&
  //         !gridTemplateRows.includes(' ');
  //       const isSingleColumn =
  //         gridTemplateColumns !== '' &&
  //         gridTemplateColumns !== 'auto' &&
  //         !gridTemplateColumns.includes(' ');

  //       if (isSingleRow || isSingleColumn) {
  //         const isRow = isSingleRow;

  //         childData.sort((a, b) =>
  //           isRow ? a.rect.left - b.rect.left : a.rect.top - b.rect.top,
  //         );

  //         let bestGapIndex = 0;
  //         let minDist = Infinity;

  //         for (let i = 0; i <= childData.length; i++) {
  //           let gapX = 0;
  //           let gapY = 0;

  //           if (i === 0) {
  //             const first = childData[0].rect;
  //             gapX = isRow ? first.left : containerCenterX;
  //             gapY = isRow ? containerCenterY : first.top;
  //           } else if (i === childData.length) {
  //             const last = childData[childData.length - 1].rect;
  //             gapX = isRow ? last.right : containerCenterX;
  //             gapY = isRow ? containerCenterY : last.bottom;
  //           } else {
  //             const prev = childData[i - 1].rect;
  //             const next = childData[i].rect;
  //             if (isRow) {
  //               gapX = (prev.right + next.left) / 2;
  //               gapY = containerCenterY;
  //             } else {
  //               gapY = (prev.bottom + next.top) / 2;
  //               gapX = containerCenterX;
  //             }
  //           }

  //           const dist = isRow
  //             ? Math.abs(gapX - clientX)
  //             : Math.abs(gapY - clientY);

  //           if (dist < minDist) {
  //             minDist = dist;
  //             bestGapIndex = i;
  //           }
  //         }

  //         return bestGapIndex < childData.length
  //           ? childData[bestGapIndex].el
  //           : null;
  //       } else {
  //         // Full 2D grid: find nearest cell center
  //         let nearest: HTMLElement | null = null;
  //         let minDist = Infinity;

  //         for (const { el, rect } of childData) {
  //           const cx = (rect.left + rect.right) / 2;
  //           const cy = (rect.top + rect.bottom) / 2;
  //           const dist = Math.hypot(cx - clientX, cy - clientY);
  //           if (dist < minDist) {
  //             minDist = dist;
  //             nearest = el;
  //           }
  //         }

  //         if (!nearest) return null;

  //         const nearestRect = nearest.getBoundingClientRect();
  //         const cx = (nearestRect.left + nearestRect.right) / 2;
  //         const before = clientX < cx;
  //         return before
  //           ? nearest
  //           : (nearest.nextElementSibling as HTMLElement | null);
  //       }
  //     } else {
  //       // Default: vertical block layout
  //       childData.sort((a, b) => a.rect.top - b.rect.top);

  //       let bestGapIndex = 0;
  //       let minDist = Infinity;

  //       for (let i = 0; i <= childData.length; i++) {
  //         let gapY = 0;
  //         if (i === 0) {
  //           gapY = childData[0].rect.top;
  //         } else if (i === childData.length) {
  //           gapY = childData[childData.length - 1].rect.bottom;
  //         } else {
  //           gapY = (childData[i - 1].rect.bottom + childData[i].rect.top) / 2;
  //         }

  //         const dist = Math.abs(gapY - clientY);
  //         if (dist < minDist) {
  //           minDist = dist;
  //           bestGapIndex = i;
  //         }
  //       }

  //       return bestGapIndex < childData.length
  //         ? childData[bestGapIndex].el
  //         : null;
  //     }
  //   },
  //   [], // No dependencies — safe to memoize with empty deps
  // );

  // ======================= UNIVERSAL DROP POSITION (LAYOUT-AGNOSTIC) ====================
  const getInsertDropPosition = useCallback(
    (
      container: HTMLElement,
      clientX: number,
      clientY: number,
    ): HTMLElement | null => {
      if (!container) return null;

      const containerRect = container.getBoundingClientRect();

      const children = Array.from(container.children).filter(
        (el): el is HTMLElement =>
          (el as HTMLElement).id !== 'drop-placeholder' &&
          (el as HTMLElement).offsetWidth > 0 &&
          (el as HTMLElement).offsetHeight > 0,
      );

      if (children.length === 0) {
        return null;
      }

      const childData = children.map((child) => ({
        el: child,
        rect: child.getBoundingClientRect(),
      }));
      let isPrimarilyHorizontal = true;

      if (children.length > 1) {
        const first = childData[0].rect;
        const second = childData[1].rect;

        const deltaX = Math.abs(second.left - first.left);
        const deltaY = Math.abs(second.top - first.top);
        isPrimarilyHorizontal = deltaX >= deltaY;
      } else {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        isPrimarilyHorizontal = containerWidth >= containerHeight;
      }
      if (isPrimarilyHorizontal) {
        childData.sort((a, b) => a.rect.left - b.rect.left);
      } else {
        childData.sort((a, b) => a.rect.top - b.rect.top);
      }
      let bestGapIndex = 0;
      let minDist = Infinity;

      for (let i = 0; i <= childData.length; i++) {
        let gapX = 0;
        let gapY = 0;

        if (i === 0) {
          // Before first
          const first = childData[0].rect;
          if (isPrimarilyHorizontal) {
            gapX = first.left;
            gapY = (first.top + first.bottom) / 2;
          } else {
            gapY = first.top;
            gapX = (first.left + first.right) / 2;
          }
        } else if (i === childData.length) {
          // After last
          const last = childData[childData.length - 1].rect;
          if (isPrimarilyHorizontal) {
            gapX = last.right;
            gapY = (last.top + last.bottom) / 2;
          } else {
            gapY = last.bottom;
            gapX = (last.left + last.right) / 2;
          }
        } else {
          // Between i-1 and i
          const prev = childData[i - 1].rect;
          const next = childData[i].rect;
          if (isPrimarilyHorizontal) {
            gapX = (prev.right + next.left) / 2;
            gapY = (prev.top + prev.bottom + next.top + next.bottom) / 4;
          } else {
            gapY = (prev.bottom + next.top) / 2;
            gapX = (prev.left + prev.right + next.left + next.right) / 4;
          }
        }
        const dist = Math.hypot(gapX - clientX, gapY - clientY);

        if (dist < minDist) {
          minDist = dist;
          bestGapIndex = i;
        }
      }

      return bestGapIndex < childData.length
        ? childData[bestGapIndex].el
        : null;
    },
    [],
  );

  const showPlaceholder = useCallback(
    (container: HTMLElement, clientX: number, clientY: number) => {
      const placeholder = getOrCreatePlaceholder(container.ownerDocument);

      let containerStyle = styleCache.get(container);
      if (!containerStyle) {
        containerStyle = getComputedStyle(container);
        styleCache.set(container, containerStyle);
      }

      const display = containerStyle.display || '';
      const isFlex = display.includes('flex');
      const isGrid = display.includes('grid');
      const flexDirection = containerStyle.flexDirection || 'row';
      const horizontal = flexDirection.includes('row');

      if (isFlex) {
        if (horizontal) {
          placeholder.style.width = '2px';
          placeholder.style.height = '100%';
        } else {
          placeholder.style.width = '100%';
          placeholder.style.height = '2px';
        }
      } else if (isGrid) {
        placeholder.style.width = '100%';
        placeholder.style.height = '4px';
      } else {
        placeholder.style.width = '100%';
        placeholder.style.height = '2px';
      }
      const afterElement = getInsertDropPosition(container, clientX, clientY);

      if (afterElement) {
        if (afterElement.previousSibling !== placeholder) {
          container.insertBefore(placeholder, afterElement);
        }
      } else {
        if (container.lastChild !== placeholder) {
          container.appendChild(placeholder);
        }
      }

      placeholder.style.display = 'block';
    },

    [getInsertDropPosition, styleCache],
  );

  const hidePlaceholder = useCallback(() => {
    const placeholder = initalPlaceholderRef.current;
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }, []);

  function getDisplayMode(el: HTMLElement | null): 'flex' | 'grid' | 'flow' {
    if (!el) return 'flow';
    const cs = window.getComputedStyle(el);
    const display = cs.display;
    if (display.includes('grid')) return 'grid';
    if (display.includes('flex')) return 'flex';
    return 'flow';
  }

  //=============== end of the layout flex and grid ==========================================
  const dragElement = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isResizingRef.current) return;

      const rawTarget = e.target;
      if (!(rawTarget instanceof Element)) return;
      const target = rawTarget as HTMLElement;

      hidePlaceholder();
      if (selectedElementsRef.current.length == 1) {
        hideResizeHandles();
        hideControls();
      }

      if (
        target.closest('.element-control-panel') ||
        target.classList.contains('resize-handle')
      ) {
        return;
      }

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      const draggableRoot = target;
      if (!selectedElementsRef.current.includes(draggableRoot)) {
        if (isMultiSelectKeyPressedRef.current) {
          toggleSelection(draggableRoot);
        } else if (selectedElementsRef.current.length > 1) {
          addToSelection(draggableRoot);
        } else {
          clearSelection();
          addToSelection(draggableRoot);
        }
      }

      activeElementRef.current = draggableRoot;
      if (!activeElementRef.current) return;

      let clientX: number, clientY: number;
      if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else return;

      const { scaleX = 1, scaleY = 1 } = getBodyScale();

      if (selectedElementsRef.current.length === 1) {
        const rect = activeElementRef.current.getBoundingClientRect();
        const ghost = activeElementRef.current.cloneNode(true) as HTMLElement;
        ghost.classList.add('ghost-element');
        Object.assign(ghost.style, {
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          margin: '0',
          zIndex: '1000',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          willChange: 'left, top',
          visibility: 'visible',
        });

        activeElementRef.current?.parentElement?.insertBefore(
          ghost,
          activeElementRef.current.nextSibling,
        );

        ghostElementRef.current = ghost;

        activeElementRef.current.style.visibility = 'hidden';
        offset.current.x = (clientX - rect.left) / scaleX;
        offset.current.y = (clientY - rect.top) / scaleY;
      } else {
        const originalPositions = new Map<HTMLElement, DOMRect>();
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        selectedElementsRef.current.forEach((el) => {
          const rect = el.getBoundingClientRect();
          originalPositions.set(el, rect);
          if (rect.width > 0 || rect.height > 0) {
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
          }
        });

        if (!isFinite(minX)) {
          selectedElementsRef.current.forEach(
            (el) => (el.style.visibility = 'visible'),
          );
          return;
        }

        const groupBox = {
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY,
          width: maxX - minX,
          height: maxY - minY,
        };
        const ghostWrapper = document.createElement('div');
        ghostWrapper.classList.add('ghost-wrapper', 'drag');
        Object.assign(ghostWrapper.style, {
          position: 'fixed',
          left: `${groupBox.left}px`,
          top: `${groupBox.top}px`,
          width: `${groupBox.width}px`,
          height: `${groupBox.height}px`,
          border: '1px dashed #4a90e2',
          background: 'rgba(74,144,226,0.1)',
          zIndex: '1000',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        });

        selectedElementsRef.current.forEach((el) => {
          const rect = originalPositions.get(el)!;
          const clone = el.cloneNode(true) as HTMLElement;
          clone.style.position = 'absolute';
          clone.style.left = `${rect.left - groupBox.left}px`;
          clone.style.top = `${rect.top - groupBox.top}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.margin = '0';
          clone.style.pointerEvents = 'none';
          clone.style.transform = 'translateZ(0)';
          ghostWrapper.appendChild(clone);
          el.style.visibility = 'hidden';
        });

        document.body.appendChild(ghostWrapper);

        ghostElementRef.current = ghostWrapper;

        offset.current.x = (clientX - groupBox.left) / scaleX;
        offset.current.y = (clientY - groupBox.top) / scaleY;
      }

      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    },
    [
      getBodyScale,
      toggleSelection,
      clearSelection,
      addToSelection,
      hideControls,
      hideResizeHandles,
      hidePlaceholder,
    ],
  );

  // =================  main part  =================
  const elementTrees = useRef<ElementAttributes[]>([]);
  const updateElementAttributes = useCallback((element: HTMLElement) => {
    if (!element.parentElement) return;

    const parent = element;
    const excludeParents = ['html', 'body'];
    if (excludeParents.includes(parent.tagName.toLowerCase())) return;

    const ensureId = (
      el: HTMLElement,
      parentId: string | null,
      index: number,
    ): string => {
      if (el.id && el.id.trim() !== '') return el.id;
      el.dataset.dynamicElement = 'true';
      return `__auto_${parentId ?? 'root'}_${index}_${el.tagName.toLowerCase()}`;
    };

    const findElementInTrees = (
      targetId: string,
      trees: ElementAttributes[],
    ) => {
      for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
        const root = trees[treeIndex];
        const stack: { node: ElementAttributes; path: number[] }[] = [
          { node: root, path: [] },
        ];

        while (stack.length) {
          const { node, path } = stack.pop()!;
          if (node.id === targetId) {
            return { treeIndex, nodePath: path, node };
          }
          for (let i = node.children.length - 1; i >= 0; i--) {
            stack.push({ node: node.children[i], path: [...path, i] });
          }
        }
      }
      return null;
    };

    const removeNodeByPath = (treeIndex: number, nodePath: number[]) => {
      if (treeIndex >= elementTrees.current.length) return false;
      if (nodePath.length === 0) {
        elementTrees.current.splice(treeIndex, 1);
        return true;
      }
      let current = elementTrees.current[treeIndex];
      for (let i = 0; i < nodePath.length - 1; i++) {
        const idx = nodePath[i];
        if (!current.children || !current.children[idx]) return false;
        current = current.children[idx];
      }
      const lastIndex = nodePath[nodePath.length - 1];
      if (lastIndex < 0 || lastIndex >= current.children.length) return false;
      current.children.splice(lastIndex, 1);
      return true;
    };

    const removeAllNodesById = (id: string) => {
      while (true) {
        const found = findElementInTrees(id, elementTrees.current);
        if (!found) break;
        removeNodeByPath(found.treeIndex, found.nodePath);
      }
    };

    // const getElementAttributes = (
    //   el: HTMLElement,
    //   parentId: string | null,
    //   index: number,
    // ): ElementAttributes => {
    //   const id = ensureId(el, parentId, index);
    //   const elementAttributes: ElementAttributes = {
    //     id,
    //     index,
    //     parentId: element.parentElement?.id,
    //     path: el.getAttribute('data-path') || '',
    //     type: el.tagName.toLowerCase(),
    //     isNew: true,
    //     textContent: getDirectTextContent(el),
    //     children: [],
    //     attributes: {},
    //     dataset: { ...el.dataset },
    //   };

    //   Array.from(el.attributes).forEach((attr) => {
    //     if (attr.name === 'style') {
    //       const styleObject: Record<string, string> = {};
    //       attr.value.split(';').forEach((declaration) => {
    //         const [property, value] = declaration
    //           .split(':')
    //           .map((p) => p.trim());
    //         if (property && value) styleObject[property] = value;
    //       });
    //       elementAttributes.attributes![attr.name] = styleObject;
    //     } else {
    //       elementAttributes.attributes![attr.name] = attr.value;
    //     }
    //   });

    //   return elementAttributes;
    // };

    const getElementAttributes = (
      el: HTMLElement,
      parentId: string | null,
      index: number,
    ): ElementAttributes => {
      const id = ensureId(el, parentId, index);

      const elementAttributes: ElementAttributes = {
        id,
        index,
        parentId: el.parentElement?.id ?? null,
        path: el.getAttribute('data-path') || '',
        type: el.tagName.toLowerCase(),
        isNew: true,
        textContent: getDirectTextContent(el),
        children: [],
        attributes: {},
        dataset: { ...el.dataset },
      };

      const styleObject: Record<string, string> = {};

      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        styleAttr.split(';').forEach((declaration) => {
          const [property, value] = declaration.split(':').map((p) => p.trim());
          if (property && value) {
            styleObject[property] = value;
          }
        });
      }

      const bgImage =
        el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        styleObject['background-image'] = bgImage;
        elementAttributes.attributes['background-image'] = bgImage;
      }

      if (Object.keys(styleObject).length > 0) {
        elementAttributes.attributes['style'] = styleObject;
      }

      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== 'style') {
          elementAttributes.attributes[attr.name] = attr.value;
        }
      });

      return elementAttributes;
    };

    const traversing = (
      currentElement: HTMLElement,
      parentId: string | null,
    ): ElementAttributes => {
      const index = Array.from(
        currentElement.parentElement?.children || [],
      ).indexOf(currentElement);
      const elementAttributes = getElementAttributes(
        currentElement,
        parentId,
        index,
      );

      Array.from(currentElement.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          const childElement = traversing(child, elementAttributes.id);
          elementAttributes.children.push(childElement);
        }
      });

      elementAttributes.children.sort((a, b) => a.index - b.index);
      return elementAttributes;
    };

    const currentDomParent = element.parentElement!;
    const currentDomIndex = Array.from(currentDomParent.children).indexOf(
      element,
    );
    const currentParentId =
      currentDomParent.id || `parent-${currentDomParent.tagName}`;

    const elementId = ensureId(element, currentParentId, currentDomIndex);
    const existingElementInfo = findElementInTrees(
      elementId,
      elementTrees.current,
    );

    if (existingElementInfo) {
      removeNodeByPath(
        existingElementInfo.treeIndex,
        existingElementInfo.nodePath,
      );
    }

    const newTree = traversing(element, currentParentId);
    removeAllNodesById(newTree.id);
    elementTrees.current.push(newTree);

    const seen = new Set<string>();
    elementTrees.current = elementTrees.current.filter((t) => {
      if (!t) return false;
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    console.log(elementTrees.current);

    window.parent?.document?.dispatchEvent(
      new CustomEvent('NEXTJS_TREE_UPDATE', {
        detail: { tree: elementTrees.current },
      }),
    );

    return elementTrees.current;
  }, []);

  const getDirectTextContent = (element: HTMLElement): string => {
    return Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim() || '')
      .join(' ')
      .trim();
  };

  const makeElementEditable = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      if (element.dataset.__isEditing === 'true') {
        const editableSpan = element.querySelector('[data-editable="true"]');
        if (editableSpan) {
          editableSpan.focus({ preventScroll: true });
          const range = document.createRange();
          range.selectNodeContents(editableSpan);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
        return;
      }

      element.dataset.__isEditing = 'true';
      const textNode = Array.from(element.childNodes).find(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim() !== '',
      ) as Text | undefined;

      const originalTextContent = textNode?.textContent || '';
      const editableSpan = document.createElement('span');
      editableSpan.textContent = originalTextContent;
      editableSpan.dataset.editable = 'true';
      editableSpan.contentEditable = 'true';
      editableSpan.style.cursor = 'text';
      editableSpan.setAttribute('role', 'textbox');
      editableSpan.setAttribute('aria-multiline', 'true');

      if (textNode) {
        element.replaceChild(editableSpan, textNode);
      } else {
        element.appendChild(editableSpan);
      }

      let isComposing = false;
      let finalized = false;

      const finalizeEditing = () => {
        if (finalized) return;
        finalized = true;

        const newTextContent = editableSpan.textContent || '';
        const newTextNode = document.createTextNode(newTextContent);
        element.replaceChild(newTextNode, editableSpan);
        if (newTextContent !== originalTextContent) {
          if (activeElementsAttributes.current) {
            updateElementAttributes(element);
          }
        }
        if (selectedElementRef?.current === element) {
          element.classList.add('selected-element');
        }

        cleanup();
      };

      const handleBlur = (e: FocusEvent) => {
        if (e.relatedTarget && element.contains(e.relatedTarget as Node)) {
          return;
        }
        finalizeEditing();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          editableSpan.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          editableSpan.textContent = originalTextContent;
          finalizeEditing();
        }
      };

      const handleCompositionStart = () => {
        isComposing = true;
      };

      const handleCompositionEnd = () => {
        isComposing = false;
      };

      const cleanup = () => {
        editableSpan.removeEventListener('blur', handleBlur);
        editableSpan.removeEventListener('keydown', handleKeyDown);
        editableSpan.removeEventListener(
          'compositionstart',
          handleCompositionStart,
        );
        editableSpan.removeEventListener(
          'compositionend',
          handleCompositionEnd,
        );
        delete element.dataset.__isEditing;
        delete (element as any).__cleanupEditable;
      };

      editableSpan.addEventListener('blur', handleBlur);
      editableSpan.addEventListener('keydown', handleKeyDown);
      editableSpan.addEventListener('compositionstart', handleCompositionStart);
      editableSpan.addEventListener('compositionend', handleCompositionEnd);

      (element as any).__cleanupEditable = cleanup;

      setTimeout(() => {
        if (finalized) return;
        try {
          editableSpan.focus({ preventScroll: true });
          const range = document.createRange();
          range.selectNodeContents(editableSpan);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch (err) {
          console.warn('Failed to focus or select text', err);
        }
      }, 10);
    },
    [updateElementAttributes],
  );

  const SELECTABLE_SELECTOR = '';

  // ==========  make editable textContent =========
  const handleElementDblClick = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      selectedElementRef.current = target;
      target.classList.add('selected-element');
      makeElementEditable(target);
    },
    [makeElementEditable],
  );

  // ============ MODIFIED HANDLE ELEMENT CLICK ============
  const handleElementClick = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const selectable = target;
      selectAbleElement.current = selectable;
      selectable.setAttribute('data-selected', 'true');
      const isInteractive = target.matches(
        'input, textarea, select, button, a, [contenteditable],svg',
      );

      if (isInteractive && selectable) {
        selectable.addEventListener('click', (event) => event.preventDefault());
        selectable.addEventListener('click', (event) =>
          event.stopPropagation(),
        );
      }
      if (isInteractive && !selectable) {
        return;
      }

      if (!selectable) {
        if (!isMultiSelectKeyPressed) {
          clearSelection();
        }
        return;
      }
      if (selectedElementsRef.current.length > 0) {
        showControlsForMultiple();
      } else {
        hideControls();
      }
      const parent = selectable.parentElement;
      if (
        parent &&
        (window.getComputedStyle(parent).display.includes('flex') ||
          window.getComputedStyle(parent).display.includes('grid'))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [
      isMultiSelectKeyPressed,
      clearSelection,
      showControlsForMultiple,
      hideControls,
    ],
  );

  // =============  hand mouse down method ===========
  const handleMouseDown = useCallback(
    (event: globalThis.MouseEvent) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;

      if (target.classList.contains('resize-handle')) return;

      const selectableEl = target;
      const isInteractivePress = target.matches(
        'input, textarea, select, button, a, [contenteditable], svg',
      );

      if (isInteractivePress && selectableEl) {
        selectableEl.addEventListener('click', (event) =>
          event.preventDefault(),
        );
        selectableEl.addEventListener('click', (event) =>
          event.stopPropagation(),
        );
      }
      if (isInteractivePress && !selectableEl) {
        return;
      }

      if (isInteractivePress) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }

      const multi = event.ctrlKey || event.metaKey || event.shiftKey;
      if (!selectableEl) {
        isSelectionDragging.current = true;
        selectionStartPoint.current = { x: event.clientX, y: event.clientY };
        createSelectionRectangle();
        const prevUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = 'none';

        const onMove = (me: globalThis.MouseEvent) => {
          if (!isSelectionDragging.current) return;

          me.preventDefault();
          updateSelectionRectangle(
            selectionStartPoint.current.x,
            selectionStartPoint.current.y,
            me.clientX,
            me.clientY,
          );
        };

        const onUp = (ue: globalThis.MouseEvent) => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.body.style.userSelect = prevUserSelect;

          if (!isSelectionDragging.current) return;
          isSelectionDragging.current = false;

          const width = Math.abs(ue.clientX - selectionStartPoint.current.x);
          const height = Math.abs(ue.clientY - selectionStartPoint.current.y);

          if (width < CLICK_THRESHOLD && height < CLICK_THRESHOLD) {
            if (!multi) clearSelection();
          } else {
            const rect = {
              left: Math.min(selectionStartPoint.current.x, ue.clientX),
              top: Math.min(selectionStartPoint.current.y, ue.clientY),
              right: Math.max(selectionStartPoint.current.x, ue.clientX),
              bottom: Math.max(selectionStartPoint.current.y, ue.clientY),
              width,
              height,
            };
            selectElementsInRectangle(rect);
          }
          hideSelectionRectangle();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        return;
      }

      if (!selectedElementsRef.current.includes(selectableEl)) {
        if (multi) {
          toggleSelection(selectableEl);
        } else {
          clearSelection();
          addToSelection(selectableEl);
        }
      } else if (multi) {
        toggleSelection(selectableEl);
      }

      handleElementClick(event);
      showControls(selectableEl);

      if (!selectableEl.hasAttribute('data-selected')) return;

      try {
        if (!selectableEl.parentElement) return;
        let elementIndex: number | null = null;
        if (selectableEl.id === '') {
          const children = selectableEl.parentElement.children;
          if (children) {
            elementIndex = Array.from(children).indexOf(selectableEl);
          }
        }
        const id = selectableEl.id
          ? selectableEl.id
          : selectableEl.parentElement.id;
        window.parent?.document?.dispatchEvent(
          new CustomEvent('ELEMENT_SELECTED', {
            detail: {
              id,
              multiSelect: multi,
              elementIndex,
              hasId: selectableEl.id !== '' ? false : true,
            },
          }),
        );
      } catch (err) {
        console.warn('Could not dispatch ELEMENT_SELECTED to parent:', err);
      }
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      const onMoveDrag = (me: globalThis.MouseEvent) => {
        const movedX = Math.abs(me.clientX - startX);
        const movedY = Math.abs(me.clientY - startY);
        if (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD) {
          moved = true;
          document.removeEventListener('mousemove', onMoveDrag);
          document.removeEventListener('mouseup', onUpDrag);
        }
        if (moved) {
          dragElement(event as unknown as MouseEvent | TouchEvent);
        }
      };

      const onUpDrag = () => {
        document.removeEventListener('mousemove', onMoveDrag);
        document.removeEventListener('mouseup', onUpDrag);
      };
      document.addEventListener('mousemove', onMoveDrag);
      document.addEventListener('mouseup', onUpDrag);
    },
    [
      createSelectionRectangle,
      updateSelectionRectangle,
      hideSelectionRectangle,
      selectElementsInRectangle,
      handleElementClick,
      dragElement,
      toggleSelection,
      clearSelection,
      addToSelection,
      showControls,
    ],
  );

  // ==========  hide the snap gride =======
  const hideSnapGuides = useCallback(() => {
    if (horizontalGuideRef.current) {
      horizontalGuideRef.current.style.display = 'none';
    }
    if (verticalGuideRef.current) {
      verticalGuideRef.current.style.display = 'none';
    }
    if (centerCrosshairRef.current) {
      centerCrosshairRef.current.style.display = 'none';
    }
    if (alignmentLinesRef.current.horizontal) {
      alignmentLinesRef.current.horizontal.remove();
      alignmentLinesRef.current.horizontal = undefined;
    }
    if (alignmentLinesRef.current.vertical) {
      alignmentLinesRef.current.vertical.remove();
      alignmentLinesRef.current.vertical = undefined;
    }
  }, []);

  /// ============= handle mouse move method ===========
  const SCROLL_THRESHOLD = 50;
  const SCROLL_SPEED = 10;
  const CONTAINER_SCROLL_THRESHOLD = 30;
  const MIN_EDGE_DISTANCE = 10;
  const PANEL_HEIGHT = 70;

  const pendingMoveEventRef = useRef<
    globalThis.MouseEvent | globalThis.TouchEvent | null
  >(null);
  const moveScheduledRef = useRef(false);

  const handleMove = useCallback(
    (rawEvent: globalThis.MouseEvent | globalThis.TouchEvent) => {
      pendingMoveEventRef.current = rawEvent;
      if (moveScheduledRef.current) return;

      moveScheduledRef.current = true;
      requestAnimationFrame(() => {
        moveScheduledRef.current = false;

        const e = pendingMoveEventRef.current as MouseEvent | TouchEvent | null;
        pendingMoveEventRef.current = null;
        if (!e) return;

        const ghost = ghostElementRef.current as HTMLElement | null;
        const active = activeElementRef.current as HTMLElement | null;
        if (!ghost || !active) return;

        let clientX: number, clientY: number;
        if ('clientX' in e) {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
        } else if (
          (e as TouchEvent).touches &&
          (e as TouchEvent).touches.length
        ) {
          clientX = (e as TouchEvent).touches[0].clientX;
          clientY = (e as TouchEvent).touches[0].clientY;
        } else {
          return;
        }
        lastMousePosition.current = { x: clientX, y: clientY };

        let targetLeft = clientX - offset.current.x;
        let targetTop = clientY - offset.current.y;

        ghost.style.pointerEvents = 'none';

        const sizeRect = ghost.getBoundingClientRect();
        const ghostWidth = sizeRect.width;
        const ghostHeight = sizeRect.height;

        let showV: number | null = null;
        let showH: number | null = null;
        let centerSnap = false;

        const container = active.parentElement as HTMLElement | null;
        if (container) {
          const cRect = container.getBoundingClientRect();
          const cCenterX = cRect.left + cRect.width / 2;
          const cCenterY = cRect.top + cRect.height / 2;

          type XCandidate = {
            left: number;
            guideX: number;
            d: number;
            priority: number;
          };
          type YCandidate = {
            top: number;
            guideY: number;
            d: number;
            priority: number;
          };
          let bestX: XCandidate | null = null;
          let bestY: YCandidate | null = null;

          const considerX = (left: number, guideX: number, priority = 0) => {
            const d = Math.abs(left - targetLeft);
            if (
              d <= snapThreshold &&
              (!bestX ||
                d < bestX.d ||
                (d === bestX.d && priority > bestX.priority))
            ) {
              bestX = { left, guideX, d, priority };
            }
          };
          const considerY = (top: number, guideY: number, priority = 0) => {
            const d = Math.abs(top - targetTop);
            if (
              d <= snapThreshold &&
              (!bestY ||
                d < bestY.d ||
                (d === bestY.d && priority > bestY.priority))
            ) {
              bestY = { top, guideY, d, priority };
            }
          };

          if (Math.abs(clientX - cCenterX) <= snapThreshold) {
            considerX(cCenterX - ghostWidth / 2, cCenterX, 1);
          }
          if (Math.abs(clientY - cCenterY) <= snapThreshold) {
            considerY(cCenterY - ghostHeight / 2, cCenterY, 1);
          }

          const siblings = Array.from(container.children).filter(
            (child) => child !== active && child !== ghost,
          ) as HTMLElement[];

          for (const sib of siblings) {
            const r = sib.getBoundingClientRect();
            const sCX = r.left + r.width / 2;
            const sCY = r.top + r.height / 2;

            considerX(r.left, r.left);
            considerX(r.right - ghostWidth, r.right);
            considerX(sCX - ghostWidth / 2, sCX);

            considerY(r.top, r.top);
            considerY(r.bottom - ghostHeight, r.bottom);
            considerY(sCY - ghostHeight / 2, sCY);
          }

          if (bestX) {
            targetLeft = bestX['left'];
            showV = bestX['guideX'];
          }
          if (bestY) {
            targetTop = bestY['top'];
            showH = bestY['guideY'];
          }

          centerSnap =
            !!bestX &&
            Math.abs(bestX['guideX'] - cCenterX) < 0.5 &&
            !!bestY &&
            Math.abs(bestY['guideY'] - cCenterY) < 0.5;
        }

        ghost.style.left = `${targetLeft}px`;
        ghost.style.top = `${targetTop}px`;

        const ghostRect = ghost.getBoundingClientRect();

        if (resizeWrapperRef.current) {
          Object.assign(resizeWrapperRef.current.style, {
            left: `${ghostRect.left}px`,
            top: `${ghostRect.top}px`,
            width: `${ghostRect.width}px`,
            height: `${ghostRect.height}px`,
          });
        }

        if (centerSnap) {
          if (centerCrosshairRef?.current) {
            Object.assign(centerCrosshairRef.current.style, {
              left: `${ghostRect.left + ghostRect.width / 2}px`,
              top: `${ghostRect.top + ghostRect.height / 2}px`,
              display: 'block',
            });
          }
          if (verticalGuideRef?.current)
            verticalGuideRef.current.style.display = 'none';
          if (horizontalGuideRef?.current)
            horizontalGuideRef.current.style.display = 'none';
        } else {
          if (centerCrosshairRef?.current)
            centerCrosshairRef.current.style.display = 'none';

          if (verticalGuideRef?.current) {
            if (showV != null) {
              Object.assign(verticalGuideRef.current.style, {
                left: `${showV}px`,
                display: 'block',
              });
            } else {
              verticalGuideRef.current.style.display = 'none';
            }
          }

          if (horizontalGuideRef?.current) {
            if (showH != null) {
              Object.assign(horizontalGuideRef.current.style, {
                top: `${showH}px`,
                display: 'block',
              });
            } else {
              horizontalGuideRef.current.style.display = 'none';
            }
          }
        }

        const elementsUnderPointer = document.elementsFromPoint(
          clientX,
          clientY,
        );
        const scrollableContainer = elementsUnderPointer.find((el) => {
          const style = window.getComputedStyle(el as Element);
          return (
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight
          );
        }) as HTMLElement | undefined;

        if (scrollableContainer) {
          const cRect = scrollableContainer.getBoundingClientRect();
          if (clientY < cRect.top + CONTAINER_SCROLL_THRESHOLD)
            scrollableContainer.scrollTop -= SCROLL_SPEED;
          else if (clientY > cRect.bottom - CONTAINER_SCROLL_THRESHOLD)
            scrollableContainer.scrollTop += SCROLL_SPEED;
          if (clientX < cRect.left + CONTAINER_SCROLL_THRESHOLD)
            scrollableContainer.scrollLeft -= SCROLL_SPEED;
          else if (clientX > cRect.right - CONTAINER_SCROLL_THRESHOLD)
            scrollableContainer.scrollLeft += SCROLL_SPEED;
        }
        const candidateContainer = rawEvent.target as HTMLElement;
        if (!candidateContainer) return;
        if (controlsRef?.current) {
          const panelWidth = controlsRef.current.offsetWidth;
          const panelLeft =
            ghostRect.left + ghostRect.width / 2 - panelWidth / 2;
          const panelTop = ghostRect.top - PANEL_HEIGHT - 10;
          controlsRef.current.style.left = `${Math.max(
            MIN_EDGE_DISTANCE,
            Math.min(
              panelLeft,
              window.innerWidth - panelWidth - MIN_EDGE_DISTANCE,
            ),
          )}px`;
          controlsRef.current.style.top = `${Math.max(
            MIN_EDGE_DISTANCE,
            panelTop,
          )}px`;
        }

        if (active.parentElement) {
          const siblingsForDistances = Array.from(active.parentElement.children)
            .filter((child) => child !== active && child !== ghost)
            .map((child) => {
              const rect = (child as HTMLElement).getBoundingClientRect();
              return {
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right,
                id: (child as HTMLElement).id || '',
              };
            });
          updateDistanceSpans(ghostRect, siblingsForDistances);
        }

        if (clientX < SCROLL_THRESHOLD) window.scrollBy(-SCROLL_SPEED, 0);
        else if (clientX > window.innerWidth - SCROLL_THRESHOLD)
          window.scrollBy(SCROLL_SPEED, 0);
        if (clientY < SCROLL_THRESHOLD) window.scrollBy(0, -SCROLL_SPEED);
        else if (clientY > window.innerHeight - SCROLL_THRESHOLD)
          window.scrollBy(0, SCROLL_SPEED);

        (e as Event).preventDefault?.();
      });
    },
    [, updateDistanceSpans],
  );

  // ========= get all elements absolute position =========
  const getAbsolutePositions = useCallback(
    (parentElement: HTMLElement | null, isPrevious: boolean): Pos[] => {
      if (!parentElement || !(parentElement instanceof HTMLElement)) {
        console.warn('Invalid container provided to getAbsolutePositions');
        return [];
      }
      const children = Array.from(parentElement.children) as HTMLElement[];
      const ghostEl = ghostElementRef.current;
      const activeEl = activeElementRef.current;
      const ghostRect = ghostEl?.getBoundingClientRect();
      return children.map((el) => {
        const rect = el.getBoundingClientRect();
        const basePosition = {
          element: el,
          id: el.id || '',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        if (
          ghostEl &&
          activeEl &&
          el === activeEl &&
          !isPrevious &&
          ghostRect
        ) {
          return {
            ...basePosition,
            top: ghostRect.top,
            left: ghostRect.left,
            width: ghostRect.width || rect.width,
            height: ghostRect.height || rect.height,
          };
        }

        return basePosition;
      });
    },
    [],
  );

  const round2 = (v: number): number => Math.round(v * 100) / 100;

  const arrangeAllElements = useCallback(
    (
      lastElementsAbsolutePositions: Pos[],
      children: HTMLCollection,
      containerRect: DOMRect,
      parent: HTMLElement,
      isResizing: boolean = false,
    ): void => {
      if (!containerRect || !children?.length) return;

      const parentStyle = getComputedStyle(parent);
      const borderLeft = parseFloat(parentStyle.borderLeftWidth) || 0;
      const borderTop = parseFloat(parentStyle.borderTopWidth) || 0;
      const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
      const paddingTop = parseFloat(parentStyle.paddingTop) || 0;

      const scrollLeft = parent.scrollLeft || 0;
      const scrollTop = parent.scrollTop || 0;

      const containerContentX = containerRect.left + borderLeft + paddingLeft;
      const containerContentY = containerRect.top + borderTop + paddingTop;

      const items: { el: HTMLElement; pos: Pos }[] = Array.from(children)
        .filter((el): el is HTMLElement => el instanceof HTMLElement)
        .filter((el) => el !== ghostElementRef?.current)
        .map((el) => {
          const pos = lastElementsAbsolutePositions.find((p) => p.id === el.id);
          return pos ? { el, pos } : null;
        })
        .filter((x): x is { el: HTMLElement; pos: Pos } => x !== null);

      if (!items.length) return;

      const prevTransitions = items.map((i) => i.el.style.transition ?? '');

      if (isResizing === false || isMultiSelectKeyPressed) {
        items.forEach((i) => (i.el.style.transition = 'none'));

        items.forEach(({ el, pos }) => {
          const cs = getComputedStyle(el);
          if (cs.position === 'absolute' || cs.position === 'fixed') {
            el.style.position = '';
          }

          el.style.width =
            typeof pos.width === 'number'
              ? `${pos.width}px`
              : pos.width || 'auto';
          el.style.height =
            typeof pos.height === 'number'
              ? `${pos.height}px`
              : pos.height || 'auto';

          el.style.marginTop = '0px';
          el.style.marginBottom = '0px';
          el.style.marginRight = 'auto';
        });
      }

      const heights = items.map(({ el }) => el.getBoundingClientRect().height);

      const offsets = items.map(({ pos }) => {
        const top =
          typeof pos.top === 'number'
            ? pos.top
            : parseFloat(String(pos.top || '0'));
        return top - containerContentY + scrollTop;
      });

      let cumulative = 0;
      for (let i = 0; i < items.length; i++) {
        const { el, pos } = items[i];
        const desiredOffset = offsets[i];
        const candidateMargin = desiredOffset - cumulative;

        el.style.marginTop = `${round2(candidateMargin)}px`;

        const left =
          typeof pos.left === 'number'
            ? pos.left
            : parseFloat(String(pos.left || '0'));
        const marginLeft = left - containerContentX + scrollLeft;
        el.style.marginLeft = `${round2(marginLeft)}px`;

        const actualTop = el.getBoundingClientRect().top;
        const actualOffset = actualTop - containerContentY + scrollTop;
        const error = desiredOffset - actualOffset;

        let usedMargin = candidateMargin;
        if (Math.abs(error) > 0.5) {
          usedMargin = candidateMargin + error;
          el.style.marginTop = `${round2(usedMargin)}px`;
        }

        cumulative += heights[i] + usedMargin;
      }

      items.forEach((item, idx) => {
        item.el.style.transition = prevTransitions[idx] || '';
      });
    },
    [ghostElementRef, isMultiSelectKeyPressed],
  );

  //=============== get insert Position ====================
  const getInsertPosition = useCallback(
    (
      container: HTMLElement,
      pos: number,
      opts: { axis?: 'y' | 'x'; clientX?: number; ignore?: HTMLElement[] } = {},
    ): HTMLElement | null => {
      if (
        !container ||
        !(container instanceof HTMLElement) ||
        GENERIC_CONTAINERS.includes(container.tagName.toLocaleLowerCase())
      )
        return null;

      const axis = opts.axis ?? 'y';
      const ignoreSet = new Set(opts.ignore ?? []);
      if (
        typeof activeElementRef !== 'undefined' &&
        activeElementRef?.current
      ) {
        ignoreSet.add(activeElementRef.current);
      }
      if (typeof ghostElementRef !== 'undefined' && ghostElementRef?.current) {
        ignoreSet.add(ghostElementRef.current);
      }

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return null;
      const candidates: { el: HTMLElement; rect: DOMRect; midpoint: number }[] =
        [];

      for (const child of children) {
        if (!(child instanceof HTMLElement)) continue;
        if (ignoreSet.has(child)) continue;

        const cs = window.getComputedStyle(child);
        if (
          cs.display === 'none' ||
          cs.visibility === 'hidden' ||
          cs.opacity === '0'
        ) {
          continue;
        }

        const rect = child.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const midpoint =
          axis === 'y'
            ? rect.top + rect.height / 2
            : rect.left + rect.width / 2;
        candidates.push({ el: child, rect, midpoint });
      }

      if (candidates.length === 0) return null;
      for (const c of candidates) {
        if (pos < c.midpoint) return c.el;
      }
      return null;
    },

    [],
  );

  const dropElement = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!ghostElementRef.current) return;

      const ghostElement = ghostElementRef.current;
      const parent = event.target as HTMLElement;

      Object.values(distanceSpanRefs.current).forEach(
        (span) => span && (span.style.display = 'none'),
      );
      hideSnapGuides();

      const clearElementStyles = (el: HTMLElement) => {
        el.style.position = '';
        el.style.top = '';
        el.style.left = '';
        el.style.visibility = 'visible';
      };

      const finalizeDrop = () => {
        ghostElement.remove();
        document.body.style.cursor = '';
        activeElementRef.current = null;
        ghostElementRef.current = null;
        currentTargetContainerRef.current = null;
        activeElementPreviousContainer.current = null;
      };

      if (
        selectedElementsRef.current.length > 1 &&
        ghostElement.classList.contains('ghost-wrapper')
      ) {
        const clonedElements = Array.from(
          ghostElement.children,
        ) as HTMLElement[];
        const absPositions = getAbsolutePositions(ghostElement, false);
        const parentRect = parent.getBoundingClientRect();

        selectedElementsRef.current.forEach((originalElement, index) => {
          const clone = clonedElements[index];
          if (!clone || !originalElement) return;

          const afterElement = getInsertPosition(parent, event.clientY);
          if (afterElement && parent.contains(afterElement)) {
            parent.insertBefore(originalElement, afterElement);
          } else {
            parent.appendChild(originalElement);
          }

          arrangeAllElements(absPositions, parent.children, parentRect, parent);
          clearElementStyles(originalElement);
        });

        if (!isResizingRef.current)
          showControlsForMultiple(selectedElementsRef.current);
        finalizeDrop();
        updateElementAttributes(parent);
        return;
      }

      if (!activeElementRef.current) return;
      const activeElement = activeElementRef.current;
      if (initalPlaceholderRef.current?.parentElement) {
        const container = initalPlaceholderRef.current.parentElement;
        const mode = getDisplayMode(container);

        if (mode === 'flex' || mode === 'grid') {
          container.insertBefore(activeElement, initalPlaceholderRef.current);
          hidePlaceholder();
          clearElementStyles(activeElement);
          finalizeDrop();
          if (!isResizingRef.current) {
            showResizeHandles(activeElement);
            showControls(activeElement);
          }
          updateElementAttributes(activeElement);
          return;
        }
      }

      // let prevPositions = null;
      // const currentPositions = getAbsolutePositions(parent, false);
      // let prevContainerRect = null;

      // if (
      //   activeElementPreviousContainer.current &&
      //   activeElementPreviousContainer.current !== parent
      // ) {
      //   prevContainerRect =
      //     activeElementPreviousContainer.current.getBoundingClientRect();
      //   prevPositions = getAbsolutePositions(
      //     activeElementPreviousContainer.current,
      //     true,
      //   ).filter((e) => e.element !== activeElement);
      // }

      initalPlaceholderRef.current?.replaceWith(activeElement);

      // const afterElement = getInsertDropPosition(parent, event.clientX, event.clientY);
      // if (afterElement && parent.contains(afterElement)) {
      //   parent.insertBefore(activeElement, afterElement);
      // } else {
      //   parent.appendChild(activeElement);
      // }

      // if (
      //   prevPositions &&
      //   activeElementPreviousContainer.current &&
      //   prevContainerRect
      // ) {
      //   arrangeAllElements(
      //     prevPositions,
      //     activeElementPreviousContainer.current.children,
      //     prevContainerRect,
      //     activeElementPreviousContainer.current,
      //   );
      // }

      // arrangeAllElements(
      //   currentPositions,
      //   parent.children,
      //   parent.getBoundingClientRect(),
      //   parent,
      // );

      clearElementStyles(activeElement);
      hidePlaceholder();

      if (!isResizingRef.current) {
        showResizeHandles(activeElement);
        showControls(activeElement);
      }

      finalizeDrop();
      updateElementAttributes(activeElement);
    },
    [
      showResizeHandles,
      updateElementAttributes,
      hideSnapGuides,
      showControls,
      arrangeAllElements,
      hidePlaceholder,
      showControlsForMultiple,
    ],
  );

  //===========  element dectedtor   ============

  const getPositionForDrop = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!ghostElementRef.current && !activeElementRef.current) return;
      const targetElement = event.target as HTMLElement;
      if (!targetElement) return;
      showPlaceholder(targetElement, event.clientX, event.clientY);
    },
    [showPlaceholder],
  );

  const addHoverEffect = (element: HTMLElement) => {
    element.classList.add('hover-element');
  };

  //============  remove  dectedtor  ============
  const removeHoverEffect = (element: HTMLElement) => {
    if (!element.classList) return;
    element.classList.remove('hover-element');
  };

  // ========== detect current parent  ==============
  const detectCurrentParent = useCallback((event: globalThis.MouseEvent) => {
    if (
      !ghostElementRef.current ||
      !activeElementRef.current ||
      !GENERIC_CONTAINERS
    )
      return;
    const display = getComputedStyle(activeElementRef.current).display;
    if (display === 'flex' || display === 'grid') return;
    const newContainer = event.target as HTMLElement;
    if (newContainer) {
      activeElementPreviousContainer.current = activeElementRef.current
        .parentElement as HTMLElement;
      newContainer.appendChild(ghostElementRef.current);
    }
  }, []);

  // ======================= ELEMENT CREATION =========================
  const createElementFromSpec = useCallback(
    (spec: any, doc: Document = document): HTMLElement => {
      const el = doc.createElement(spec.name || 'div');
      if (spec.id) el.id = spec.id;
      if (spec.class) {
        const classStr = String(spec.class).trim();
        if (classStr) el.className = classStr;
      }
      if (spec.html) {
        el.innerHTML = spec.html;
      } else if (spec.text) {
        el.textContent = String(spec.text);
      }
      if (spec.attributes) {
        for (const key in spec.attributes) {
          const value = spec.attributes[key];
          if (value !== undefined && value !== null) {
            el.setAttribute(key, String(value));
          }
        }
      }
      if (spec.dataset) {
        for (const key in spec.dataset) {
          const value = spec.dataset[key];
          if (value !== undefined && value !== null) {
            el.dataset[key] = String(value);
          }
        }
      }
      if (Array.isArray(spec.children) && spec.children.length > 0) {
        const fragment = doc.createDocumentFragment();
        for (let i = 0; i < spec.children.length; i++) {
          fragment.appendChild(createElementFromSpec(spec.children[i], doc));
        }
        el.appendChild(fragment);
      }

      return el;
    },
    [],
  );

  // ======================= DROP HANDLER =============================
  const getDropElement = useCallback(
    (event: globalThis.DragEvent): HTMLElement | undefined => {
      try {
        const container = event.target as HTMLElement;
        if (!container) return;

        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) return;

        const elementJson = dataTransfer.getData('application/json');
        if (!elementJson) return;

        const elementData = JSON.parse(elementJson);
        if (!elementData?.name) return;

        const newElement = createElementFromSpec(elementData, document);

        initalPlaceholderRef.current?.replaceWith(newElement);
        if (newElement.parentElement) {
          const parent = newElement.parentElement;
          ['data-path', 'data-page'].forEach((attr) => {
            const value = parent.getAttribute(attr);
            if (value) {
              newElement.setAttribute(attr, value);
            }
          });
        }

        hidePlaceholder();
        updateElementAttributes(newElement);
        return newElement;
      } catch (err) {
        console.error('Error in getDropElement:', err);
        return;
      }
    },
    [createElementFromSpec, updateElementAttributes, hidePlaceholder],
  );

  // ======================= DRAG EVENTS ==============================
  const dragEnter = useCallback((event: DragEvent) => {
    const target = event.target as HTMLElement;
    target.classList.add('drag-over');
  }, []);

  const dragOver = useCallback(
    (event: globalThis.DragEvent) => {
      event.preventDefault();
      const x = event.clientX;
      const y = event.clientY;
      const targetElement = event.target as HTMLElement | null;
      if (!targetElement) return;
      currentTargetContainerRef.current = targetElement;
      currentTargetContainerRef.current.classList.add('dragOver');
      showPlaceholder(targetElement, x, y);
    },
    [showPlaceholder],
  );

  const dragLeave = useCallback(
    (event: globalThis.DragEvent) => {
      event.preventDefault();
      const targetElement = event.target as HTMLElement | null;
      if (
        targetElement &&
        !targetElement.contains(event.relatedTarget as Node)
      ) {
        targetElement.classList.remove('dragOver', 'drag-over');
        hidePlaceholder();
      }
    },
    [hidePlaceholder],
  );

  const dragEnd = useCallback(() => {
    hidePlaceholder();
  }, [hidePlaceholder]);

  // ================  main hook get first dropped element ==========
  useEffect(() => {
    const handleMouseEnter = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target ||
        target === document.body ||
        !target.classList ||
        target.classList.contains('resize-handle') ||
        target.closest('.element-control-panel') ||
        target.closest('.ai-prompt-container')
      ) {
        return;
      }
      addHoverEffect(target);
    };

    const handleMouseLeave = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === document.body) return;
      removeHoverEffect(target);
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('drop', getDropElement);
    document.addEventListener('mouseup', dropElement);
    document.addEventListener('dragover', dragOver);
    document.addEventListener('dragleave', dragLeave);
    document.addEventListener('dragend', dragEnd);
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mouseover', detectCurrentParent);
    document.addEventListener('mouseover', getPositionForDrop);
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node) &&
        selectedElementRef.current !== event.target
      ) {
        hideControls();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('drop', getDropElement);
      document.removeEventListener('mousemove', handleMove, true);
      document.removeEventListener('touchmove', handleMove, true);
      document.removeEventListener('dragover', dragOver);
      document.removeEventListener('mouseup', dropElement);
      document.removeEventListener('dragleave', dragLeave);
      document.removeEventListener('dragend', dragEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseover', detectCurrentParent);
      document.removeEventListener('mouseover', getPositionForDrop);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [
    handleMove,
    dropElement,
    dragEnter,
    dragOver,
    dragLeave,
    dragEnd,
    handleMouseDown,
    hideControls,
    detectCurrentParent,
    updateElementAttributes,
    getInsertPosition,
    getDropElement,
    getPositionForDrop,
  ]);

  useEffect(() => {
    createDistanceSpans();
    return () => {
      Object.values(distanceSpanRefs.current).forEach((span) => {
        if (span) span.remove();
      });
    };
  }, [createDistanceSpans]);

  useEffect(() => {
    const onPointerDown = (ev: PointerEvent) => {
      if (ev.button && ev.button !== 0) return;
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (!ghostElementRef.current) return;
      const { scaleX = 1, scaleY = 1 } = getBodyScale();
      const left = ev.clientX - offset.current.x * scaleX;
      const top = ev.clientY - offset.current.y * scaleY;
      ghostElementRef.current.style.left = `${left}px`;
      ghostElementRef.current.style.top = `${top}px`;
      ev.preventDefault();
    };

    const onPointerUp = () => {};
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [getBodyScale]);

  useEffect(() => {
    document.addEventListener('dblclick', handleElementDblClick);
    return () =>
      document.removeEventListener('dblclick', handleElementDblClick);
  }, [handleElementDblClick]);

  const latestHandlersRef = useRef({
    handleControlClick,
    handleAiPrompt,
  });

  useEffect(() => {
    latestHandlersRef.current = {
      handleControlClick,
      handleAiPrompt,
    };
  }, [handleControlClick, handleAiPrompt]);

  // ============ ADD KEYBOARD EVENT LISTENERS ============
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsMultiSelectKeyPressed(true);
        isMultiSelectKeyPressedRef.current = true;
      }
      if (e.key === 'Escape' && selectedElementsRef.current.length > 0) {
        clearSelection();
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsMultiSelectKeyPressed(false);
        isMultiSelectKeyPressedRef.current = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [clearSelection, addToSelection, showControlsForMultiple]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { selectedDomIds } = event.detail.payload;
      const previouslySelected = document.querySelectorAll('.selected-element');
      previouslySelected.forEach((element: any) => {
        selectedElementsRef.current.push(element);
      });

      if (selectedElementsBackRef.current.length > 1) {
        showControlsForMultiple();
      }

      if (selectedDomIds.length === 0) {
        selectedElementRef.current = null;
        return;
      }
      selectedDomIds.forEach((selectedId: string) => {
        const selectable = document.getElementById(selectedId);
        if (!selectable) return;
        selectable.classList.add('selected-element');
        if (!selectable.hasAttribute('tabindex')) {
          selectable.tabIndex = -1;
        }
        if (!selectable.parentElement) return;
        updateElementAttributes(selectable.parentElement);
      });
      const primaryElementId = selectedDomIds[selectedDomIds.length - 1];
      const primaryElement = document.getElementById(primaryElementId);

      if (primaryElement) {
        selectedElementRef.current = primaryElement;
        showControls(primaryElement);
        showResizeHandles(primaryElement);
        primaryElement.focus({ preventScroll: true });
      }
    };
    document.addEventListener('SELECTED_EVENT', handler as EventListener);
    return () => {
      document.removeEventListener('SELECTED_EVENT', handler as EventListener);
    };
  }, [
    showControlsForMultiple,
    updateElementAttributes,
    showControls,
    showResizeHandles,
  ]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    /* Wrap everything in a relatively positioned container */
      .resize-container {
        position: relative;
      }
      /* The element being resized must be absolutely positioned */
      .resizable-element {
        position: absolute;
        top: 0;
        left: 0;
        box-sizing: border-box;
      }
      /* The resize handles wrapper must also be absolutely positioned */
      .resize-handles-wrapper {
        position: absolute;
        border: 1px solid green;
        pointer-events: none;
        box-sizing: border-box;
      }
    /* Handle styles remain the same */
    .resize-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #fff;
      border: 1px solid #1f883d;
      border-radius: 50%;
      z-index: 10;
      pointer-events: auto;
    }
      .resize-handle-n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
      .resize-handle-e { top: 50%; right: -5px; transform: translateY(-50%); cursor: e-resize; }
      .resize-handle-s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
      .resize-handle-w { top: 50%; left: -5px; transform: translateY(-50%); cursor: w-resize; }
      .resize-handle-ne { top: -5px; right: -5px; cursor: ne-resize; }
      .resize-handle-nw { top: -5px; left: -5px; cursor: nw-resize; }
      .resize-handle-se { bottom: -5px; right: -5px; cursor: se-resize; }
      .resize-handle-sw { bottom: -5px; left: -5px; cursor: sw-resize; }
      
      /* New control panel styles */
     .element-control-panel {
      display: flex;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      height: 50px;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 8px;
      pointer-events: auto;
    }
    
    .control-btn {
      background: none;
      border: none;
      padding: 0 12px;
      cursor: pointer;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .control-btn:hover {
      background: #f0f0f0 !important;
    }
    
    .control-btn:active {
      background: #e0e0e0 !important;
      transform: scale(0.95);
    }
    
    .control-btn svg {
      transition: all 0.2s;
    }
    
    .control-btn:hover svg {
      transform: scale(1.1);
    }

    .control-tooltip {
      position: absolute;
      background: #22883D;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1003;
      display: none;
      pointer-events: none;
      white-space: nowrap;
    }
    
    /* AI Prompt styles */
    .ai-prompt-container {
      display: none;
      position: absolute;
      left: 100%;
      top: 0;
      margin-left: 8px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px;
      width: 300px;
      z-index: 1002;
    }
    
    .ai-prompt-container textarea {
      width: 100%;
      min-height: 100px;
      margin-bottom: 12px;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      resize: vertical;
      outline:none;
    }

    .ai-prompt-container textarea:focus{
        outline:none;   
    }
    
    .ai-prompt-container button {
      width: 100%;
      padding: 8px;
      background: #1f883d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      hiehgt: 10px;
    }
    
    .ai-prompt-container button:hover {
      background: #166f2e;
    }
    `;
    document.head.appendChild(style);
    if (!controlsInitialized.current) {
      createControlPanel();
      controlsInitialized.current = true;
    }

    return () => {
      document.head.removeChild(style);
      if (controlsRef.current) controlsRef.current.remove();
    };
  }, [createControlPanel]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    /* Guide Line Styles */
    .guide-line {
      position: absolute;
      z-index: 9997;
      pointer-events: none;
    }
    
    .guide-line-horizontal {
      width: 100%;
      height: 1px;
      background: rgba(255, 50, 50, 0.7);
      left: 0;
    }
    
    .guide-line-vertical {
      width: 1px;
      height: 100%;
      background: rgba(255, 50, 50, 0.7);
      top: 0;
    }
    
    /* Center Crosshair */
    .center-crosshair {
      position: absolute;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      border: 1px solid rgba(255, 50, 50, 0.7);
      z-index: 9997;
      pointer-events: none;
    }
    
    .center-crosshair::before,
    .center-crosshair::after {
      content: '';
      position: absolute;
      background: rgba(255, 50, 50, 0.7);
    }
    
    .center-crosshair::before {
      width: 1px;
      height: 100vh;
      left: 50%;
      top: -50vh;
    }
    
    .center-crosshair::after {
      width: 100vw;
      height: 1px;
      top: 50%;
      left: -50vw;
    }
  `;

    style.textContent += `
      .hover-element {
        outline: 1px solid #22883D;
        outline-offset: 4px;
        border-radius : 1px !important;
        transition: all 10ms ease-in-out;

      }
    
    `;
    style.textContent += `
      .distance-span {
        position: absolute;
        z-index: 9998;
        pointer-events: none;
      }
      
      .distance-line {
        position: absolute;
        background: rgba(0, 150, 255, 0.7);
      }
      
      .distance-label {
        position: absolute;
        background: rgba(0, 100, 255, 0.8);
        color: white;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 12px;
        font-family: sans-serif;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      }
`;
    document.head.appendChild(style);
    if (!horizontalGuideRef.current) {
      const horizontalGuide = document.createElement('div');
      horizontalGuide.className = 'guide-line guide-line-horizontal';
      horizontalGuide.style.display = 'none';
      horizontalGuideRef.current = horizontalGuide;
      document.body.appendChild(horizontalGuide);
    }

    if (!verticalGuideRef.current) {
      const verticalGuide = document.createElement('div');
      verticalGuide.className = 'guide-line guide-line-vertical';
      verticalGuide.style.display = 'none';
      verticalGuideRef.current = verticalGuide;
      document.body.appendChild(verticalGuide);
    }

    if (!centerCrosshairRef.current) {
      const crosshair = document.createElement('div');
      crosshair.className = 'center-crosshair';
      crosshair.style.display = 'none';
      centerCrosshairRef.current = crosshair;
      document.body.appendChild(crosshair);
    }

    return () => {
      document.head.removeChild(style);
      if (horizontalGuideRef.current) horizontalGuideRef.current.remove();
      if (verticalGuideRef.current) verticalGuideRef.current.remove();
      if (centerCrosshairRef.current) centerCrosshairRef.current.remove();
    };
  }, []);

  // ============ ADD SELECTION RECTANGLE STYLES ============
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    .selection-rectangle {
      position: fixed;
      background-color: rgba(66, 153, 225, 0.2);
      border: 2px solid rgba(66, 153, 225, 0.8);
      border-radius: 4px;
      pointer-events: none;
      z-index: 9990;
    }
    .multi-selected {
      outline: 2px dashed #4299e1;
      outline-offset: 2px;
    }
    .secondary-ghost {
      opacity: 0.7 !important;
      z-index: 999 !important;
    }
    .dragOver {
        border: 1px dashed green;
    }
  `;

    style.textContent = `
    .dnd-placeholder {
      flex: 0 0 auto !important;
      transition: all 0.2s ease;
      pointer-events: none;
      user-select: none;
      background: rgba(0, 255, 0, 0.1);
      border: 1px dashed green;
      border-radius: 4px;
      padding: 10px;
      margin: 0 !important; /* Remove margins to prevent layout shifts */
    }

    /* Add to your global styles */
    .dnd-active {
      transition: none !important; /* Disable transitions during drag */
    }
  
  `;

    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', hideControls);
    document.addEventListener('scroll', hideResizeHandles);

    return () => {
      document.removeEventListener('scroll', hideResizeHandles);
      document.removeEventListener('scroll', hideControls);
    };
  }, [hideControls, hideResizeHandles]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const payload = event.detail.payload;
      if (payload && selectAbleElement.current)
        updateElementAttributes(selectAbleElement.current);
    };
    document.addEventListener('ELEMENT_UPDATED', handler as EventListener);
    return () => {
      document.removeEventListener('ELEMENT_UPDATED', handler as EventListener);
    };
  }, [updateElementAttributes]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const type = event.detail.type;
      if (type === false && selectAbleElement.current) {
        console.log(event);
        updateElementAttributes(selectAbleElement.current);
      }
    };
    document.addEventListener(
      'DISPATCH_EMPTY_ELEMENTATTRIBUTE',
      handler as EventListener,
    );
    return () => {
      document.removeEventListener(
        'DISPATCH_EMPTY_ELEMENTATTRIBUTE',
        handler as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const elementId = event.detail.elementId;
      if (elementId && selectAbleElement.current) {
        showResizeHandles(selectAbleElement.current);
      }
    };
    document.addEventListener(
      'UPDATE_RESIZE_HANDLER',
      handler as EventListener,
    );
    return () => {
      document.removeEventListener(
        'UPDATE_RESIZE_HANDLER',
        handler as EventListener,
      );
    };
  }, []);

  return null;
}
