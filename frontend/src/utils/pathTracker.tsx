"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PathTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      localStorage.setItem("nextjs-path", pathname);
      window.parent.document.dispatchEvent(new Event("storage"));
    }
  }, [pathname]);

  return null;
}
