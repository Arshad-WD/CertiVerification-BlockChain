"use client";

import { useState, useEffect } from "react";

export function useMousePosition(ref: React.RefObject<HTMLElement>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const node = ref.current;
    if (node) {
      node.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (node) {
        node.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [ref]);

  return position;
}
