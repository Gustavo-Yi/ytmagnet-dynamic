import React, {
    useMemo,
    useState,
    useEffect,
    useCallback,
    Suspense,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Leva } from "leva";
// --- REAL DATA IMPORT ---
import shoes from "../../../data/shoes.json";
import MiniMap from "../MiniMap";
import { DEFAULT_CONFIG, CONFIG } from "./gridConfig";
import {
    rigState,
    setRigZoom,
    calculateGridDimensions,
    calculateGridHomeTargetY,
    matchesFilter,
} from "./gridState";
import { useGridConfig } from "./useGridConfig";
import { Rig } from "./Rig";
import { GridCanvas } from "./GridCanvas";
import { UnifiedControlBar } from "../GridUI";
import "../HoloCardMaterial"; // Registers <holoCardMaterial /> with R3F

// --- PRELOAD ALL PRODUCT TEXTURES ---
// This keeps product images cached before switching filters or collections.
shoes.forEach((product) => {
    useTexture.preload(product.image_url);
});

// --- MAIN EXPORT ---
export default function ShoeGrid() {
    const [initialZoom] = useState(DEFAULT_CONFIG.zoomOut);
    const [currentZoom, setCurrentZoom] = useState(
        rigState.zoom
    );
    const controls = useGridConfig();
    // Track zoom state for UI components
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentZoom(rigState.zoom);
        }, 50); // Update every 50ms
        return () => clearInterval(interval);
    }, []);
    const isZoomedIn = currentZoom <= CONFIG.zoomIn + 0.5;

    // Responsive zoom for mobile viewports
    useEffect(() => {
        const updateResponsiveZoom = () => {
            const width = window.innerWidth;
            let newZoomOut;
            if (width < 480) {
                newZoomOut = 48; // Phone
            } else if (width < 768) {
                newZoomOut = 38; // Tablet portrait
            } else {
                newZoomOut = DEFAULT_CONFIG.zoomOut;
            }
            CONFIG.zoomOut = newZoomOut;
            // Only update current zoom if we're in zoomed-out state
            if (rigState.zoom > CONFIG.zoomIn + 2) {
                setRigZoom(newZoomOut);
                setCurrentZoom(newZoomOut);
            }
        };
        updateResponsiveZoom();
        window.addEventListener("resize", updateResponsiveZoom);
        return () => window.removeEventListener("resize", updateResponsiveZoom);
    }, []);
    const [shapeFilter, setShapeFilter] = useState("all");
    const [activeItemId, setActiveItemId] = useState(null);
    const clearActiveItem = useCallback(() => {
        rigState.activeId = null;
        setActiveItemId(null);
    }, []);
    const activateItem = useCallback((index) => {
        rigState.activeId = index;
        setActiveItemId(index);
    }, []);

    // Product collections are now driven by real magnet data only.
    const collectionsData = useMemo(() => {
        const ndfeb = shoes.filter(
            (product) => product.material === "neodymium"
        );
        const ferrite = shoes.filter(
            (product) => product.material === "ferrite"
        );
        return [ndfeb, ferrite];
    }, []);
    // --- Grid Stack State ---
    // Instead of one list of items, we keep a stack of "Rendered Layers".
    // This allows us to have one layer exiting and one layer entering simultaneously.
    // Initial grid uses the NdFeB placeholder collection (index 0)
    const [gridLayers, setGridLayers] = useState(() => [
        {
            id: "init",
            items: collectionsData[0],
            mode: "enter", // 'enter' | 'exit'
            startTime: 0,
        },
    ]);
    const [activeCollectionIdx, setActiveCollectionIdx] =
        useState(0);
    const handleCollectionSwitch = (index) => {
        if (index === activeCollectionIdx) return;
        const now = Date.now();
        setGridLayers((prev) => {
            // 1. Mark existing 'enter' layers as 'exit'
            const exitingLayers = prev.map((layer) =>
                layer.mode === "enter"
                    ? { ...layer, mode: "exit", startTime: now }
                    : layer
            );
            // 2. Add new 'enter' layer
            const newLayer = {
                id: `grid-${index}-${now}`, // Unique ID for key
                items: collectionsData[index],
                mode: "enter",
                startTime: now,
            };
            return [...exitingLayers, newLayer];
        });
        setActiveCollectionIdx(index);
        setShapeFilter("all");
        clearActiveItem();
        // 3. Cleanup old layers after transition time
        setTimeout(() => {
            setGridLayers((prev) =>
                prev.filter((layer) => layer.mode === "enter")
            );
        }, CONFIG.cleanupTimeout);
    };
    const handleZoomTrigger = (target) => {
        if (target === "OUT") {
            clearActiveItem();
            rigState.velocity.set(0, 0, 0);
            setRigZoom(CONFIG.zoomOut);
            rigState.target.set(0, homeTargetY, 0);
            rigState.current.set(0, homeTargetY, 0);
            setCurrentZoom(CONFIG.zoomOut);
        } else if (typeof target === "number") {
            setRigZoom(target);
        }
    };

    const handleShapeFilterChange = (filter) => {
        if (filter === shapeFilter) return;
        setShapeFilter(filter);
        clearActiveItem();
    };
    // Determine active grid dimensions for the Rig
    // We use the dimensions of the LAST layer (the incoming one)
    const activeLayer = gridLayers[gridLayers.length - 1];
    // Calculate active item count for minimap and rig bounds.
    const filteredItemCount = useMemo(() => {
        return activeLayer.items.filter((item) => matchesFilter(item, shapeFilter)).length;
    }, [activeLayer.items, shapeFilter]);

    const activeDims = calculateGridDimensions(
        filteredItemCount
    );
    const zoomOutVisibleHeight =
        2 * Math.tan((45 * Math.PI) / 360) * CONFIG.zoomOut;
    const homeTargetY = calculateGridHomeTargetY(
        filteredItemCount,
        zoomOutVisibleHeight
    );

    useEffect(() => {
        rigState.target.set(0, homeTargetY, 0);
        rigState.current.set(0, homeTargetY, 0);
    }, [activeCollectionIdx, shapeFilter, homeTargetY]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "#f0f0f0",
                position: "relative",
                overflow: "hidden",
                touchAction: "none", // Prevent mobile browser touch gestures
            }}
        >
            <Leva hidden />
            <Canvas
                camera={{ position: [0, 0, initialZoom], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.NoToneMapping,
                }}
            >
                {/* Rig is now shared, based on the dimensions of the active grid */}
                <Rig
                    gridW={activeDims.width}
                    gridH={activeDims.height}
                    onClearActiveItem={clearActiveItem}
                />
                <fog
                    attach="fog"
                    args={[
                        "#f0f0f0",
                        controls?.fogNear ?? DEFAULT_CONFIG.fogNear,
                        controls?.fogFar ?? DEFAULT_CONFIG.fogFar,
                    ]}
                />
                {/* Suspense boundary for texture loading */}
                <Suspense fallback={null}>
                    {/* Render all active layers (Entering + Exiting) */}
                    {gridLayers.map((layer) => (
                        <GridCanvas
                            key={layer.id} // Essential for React to treat them as different trees
                            items={layer.items}
                            gridVisible={layer.mode === "enter"}
                            transitionStartTime={layer.startTime}
                            interactive={layer.mode === "enter"} // Only entering grid is clickable
                            filter={shapeFilter}
                            activeItemId={
                                layer.mode === "enter" ? activeItemId : null
                            }
                            onActivateItem={activateItem}
                            onClearActiveItem={clearActiveItem}
                        />
                    ))}
                </Suspense>
            </Canvas>
            <div className="product-grid-viewport-mask product-grid-viewport-mask-top" />
            <div className="product-grid-viewport-mask product-grid-viewport-mask-bottom" />
            <MiniMap
                gridDims={activeDims}
                rigState={rigState}
                config={CONFIG}
                totalItems={filteredItemCount}
                isZoomedIn={isZoomedIn}
            />
            <UnifiedControlBar
                currentCollection={activeCollectionIdx}
                onSwitch={handleCollectionSwitch}
                setZoomTrigger={handleZoomTrigger}
                isZoomedIn={isZoomedIn}
                shapeFilter={shapeFilter}
                onShapeFilterChange={handleShapeFilterChange}
            />
        </div>
    );
}
