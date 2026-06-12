import React, { useEffect, useState, useRef } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function CloseButton({
  isActive,
  position,
  onClose,
}) {
  const { gl } = useThree();
  const [shouldShow, setShouldShow] = useState(false);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);

  // 250ms delay before showing
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isActive) {
      // Use setTimeout(0) to avoid synchronous setState
      timerRef.current = setTimeout(() => {
        setShouldShow(false);
      }, 0);
      return () => {
        if (timerRef.current)
          clearTimeout(timerRef.current);
      };
    }

    timerRef.current = setTimeout(() => {
      setShouldShow(true);
    }, 250);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  // Convert 3D position to screen coordinates for Html
  // Html centers by default, so we need to adjust
  const [x, y, z] = position;

  return (
    <Html
      position={[x, y, z]}
      center
      zIndexRange={[118, 108]}
      style={{
        pointerEvents: "auto",
      }}
    >
      <button
        className="product-preview-close-button"
        aria-label="Close product preview"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseEnter={() => {
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "pointer";
          }
        }}
        onMouseLeave={() => {
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        style={{
          opacity: shouldShow ? 0.88 : 0,
          transform: shouldShow ? "scale(1)" : "scale(0.8)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseOut={(e) => {
          if (shouldShow) {
            e.currentTarget.style.opacity = "0.88";
          }
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </Html>
  );
}
