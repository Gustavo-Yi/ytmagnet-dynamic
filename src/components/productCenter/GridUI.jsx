import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { CONFIG } from "./grid/gridConfig";
// 1. THE PHYSICS
// High stiffness, moderate damping = "Snappy but smooth" (Apple feel)
const islandTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1,
};

export function UnifiedControlBar({
  currentCollection,
  onSwitch,
  setZoomTrigger,
  isZoomedIn,
  shapeFilter,
  onShapeFilterChange,
}) {
  const { lang } = useLanguage();
  const collections =
    lang === "zh"
      ? ["钕铁硼", "铁氧体"]
      : ["Neodymium", "Ferrite"];
  const shapeFilters =
    lang === "zh"
      ? [
          { id: "all", label: "全部" },
          { id: "round", label: "圆形" },
          { id: "block", label: "方形" },
          { id: "ring", label: "环形" },
          { id: "arc", label: "瓦形" },
          { id: "custom", label: "异形" },
        ]
      : [
          { id: "all", label: "All" },
          { id: "round", label: "Round" },
          { id: "block", label: "Block" },
          { id: "ring", label: "Ring" },
          { id: "arc", label: "Arc" },
          { id: "custom", label: "Custom" },
        ];

  return (
    <div
      className="control-bar-container"
      style={{
        position: "fixed",
        bottom: "40px",
        left: "0",
        right: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {/* 
        THE ISLAND CONTAINER
        - layout: Animates width/height changes
        - borderRadius: 32px is standard for pill shapes
      */}
      <Motion.div
        className="control-bar-island"
        layout
        transition={islandTransition}
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 240, 235, 0.4) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(245, 235, 255, 0.4) 100%)", // Very subtle orange to purple gradient for glassy depth
          backdropFilter: "blur(40px) saturate(200%)", // Increased blur for more glassy feel
          WebkitBackdropFilter: "blur(40px) saturate(200%)", // Safari support
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.3)", // Subtle white border for glass edge
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)", // Soft shadow + inner highlight
          padding: "6px",
          display: "flex",
          alignItems: "center",
          pointerEvents: "auto",
          height: "56px",
          overflow: "hidden", // Crucial for clipping content during resize
        }}
      >
        {/* 
          mode="popLayout" is CRITICAL. 
          It lets the outgoing component "pop" out of the layout flow 
          so the container can instantly shrink/grow to the new content's size.
        */}
        <AnimatePresence mode="popLayout" initial={false}>
          {isZoomedIn ? (
            /* ---------------- STATE 2: COMPACT (Zoomed In) ---------------- */
            <Motion.div
              key="compact-mode"
              initial={{
                opacity: 0,
                scale: 0.5,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                filter: "blur(4px)",
              }}
              transition={{
                ...islandTransition,
                opacity: { duration: 0.2 },
              }}
              style={{ display: "flex" }}
            >
              <ControlButton
                icon="remove"
                onClick={() => setZoomTrigger("OUT")}
                label="Zoom Out"
              />
            </Motion.div>
          ) : (
            /* ---------------- STATE 2: EXPANDED (Zoomed Out) ---------------- */
            <Motion.div
              key="expanded-mode"
              initial={{
                opacity: 0,
                scale: 0.9,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                filter: "blur(4px)",
              }}
              transition={{
                ...islandTransition,
                opacity: { duration: 0.2 },
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ControlButton
                icon="add"
                onClick={() =>
                  setZoomTrigger(CONFIG.zoomIn)
                }
                label="Zoom In"
              />

              {/* Vertical Divider */}
              <Motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "24px" }}
                transition={{ delay: 0.1 }}
                style={{
                  width: "1px",
                  background: "rgba(0,0,0,0.08)",
                  margin: "0 2px",
                  boxShadow:
                    "0 0 1px rgba(255, 255, 255, 0.3)", // Subtle highlight for glassy feel
                }}
              />

              {/* Collection Tabs Group */}
              <div style={{ display: "flex", gap: "2px" }}>
                {collections.map((name, index) => {
                  const isActive =
                    currentCollection === index;
                  return (
                    <TabButton
                      key={name}
                      isActive={isActive}
                      onClick={() => onSwitch(index)}
                    >
                      {name}
                    </TabButton>
                  );
                })}
              </div>

              <Motion.div
                layout
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={islandTransition}
                style={{
                  width: "1px",
                  height: "24px",
                  background: "rgba(0,0,0,0.08)",
                  margin: "0 4px",
                  transformOrigin: "center",
                }}
              />

              <Motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={islandTransition}
                style={{ display: "flex", gap: "4px" }}
              >
                {shapeFilters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    isActive={shapeFilter === filter.id}
                    onClick={() => onShapeFilterChange(filter.id)}
                  >
                    {filter.label}
                  </FilterChip>
                ))}
              </Motion.div>

            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.div>

      {/* Responsive scaling for shorter viewports (tablets) and mobile */}
      <style>{`
        @media (max-height: 800px) {
          .control-bar-container {
            bottom: 24px !important;
          }
          .control-bar-island {
            height: 48px !important;
            border-radius: 24px !important;
            padding: 4px !important;
          }
        }
        @media (max-height: 650px) {
          .control-bar-container {
            bottom: 16px !important;
          }
          .control-bar-island {
            height: 44px !important;
          }
        }
        @media (max-width: 768px) {
          .control-bar-container {
            bottom: 20px !important;
          }
          .control-bar-island {
            height: 48px !important;
            padding: 4px !important;
          }
        }
        @media (max-width: 480px) {
          .control-bar-container {
            bottom: 16px !important;
          }
          .control-bar-island {
            height: 44px !important;
          }
          .control-button {
            width: 36px !important;
            height: 36px !important;
          }
          .tab-button {
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
          .filter-chip {
            padding: 4px 8px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}

// --- Sub-components for cleaner code & isolated animations ---

function ControlButton({ onClick, icon, label }) {
  return (
    <Motion.button
      layout="position" // Prevents icon distortion during resize
      onClick={onClick}
      className="control-button"
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(0,0,0,0.05)",
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        color: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        outline: "none",
      }}
      aria-label={label}
    >
      {/* Simple SVG Icons instead of text for a sharper look */}
      {icon === "add" ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )}
    </Motion.button>
  );
}

function TabButton({ children, isActive, onClick }) {
  return (
    <Motion.button
      layout
      onClick={onClick}
      className="tab-button"
      style={{
        position: "relative",
        border: "none",
        background: "transparent",
        color: isActive ? "#000" : "#666",
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        whiteSpace: "nowrap", // Prevents text wrapping during resize
        zIndex: 1,
        transition: "color 0.2s ease",
      }}
    >
      {children}
      {isActive && (
        <Motion.div
          layoutId="activeTabIndicator"
          transition={islandTransition}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255, 255, 255, 0.6)", // Solid background for active state
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            zIndex: -1,
          }}
        />
      )}
    </Motion.button>
  );
}

function FilterChip({ children, isActive, onClick }) {
  return (
    <Motion.button
      layout
      onClick={onClick}
      className="filter-chip"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={islandTransition}
      style={{
        position: "relative",
        border: "none",
        background: "transparent",
        color: isActive ? "#fff" : "#555",
        padding: "6px 12px",
        borderRadius: "14px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        whiteSpace: "nowrap",
        zIndex: 1,
      }}
    >
      {isActive && (
        <Motion.div
          layoutId="activeShapeFilterIndicator"
          transition={islandTransition}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            borderRadius: "14px",
            zIndex: -1,
          }}
        />
      )}
      {!isActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "14px",
            zIndex: -1,
          }}
        />
      )}
      {children}
    </Motion.button>
  );
}

