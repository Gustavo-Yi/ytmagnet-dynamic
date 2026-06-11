import React, {
    useMemo,
    useState,
    useEffect,
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
import { TopologyBackground } from "../TopologyBackground";
import "../HoloCardMaterial"; // Registers <holoCardMaterial /> with R3F

// --- PRELOAD ALL TEXTURES ---
// This ensures all shoe images are cached before switching collections
shoes.forEach((shoe) => {
    useTexture.preload(shoe.image_url);
});

const SHAPES = ["round", "block", "ring", "arc", "custom"];

const withPlaceholderShapes = (items) =>
    items.map((item, index) => ({
        ...item,
        shape: item.shape || SHAPES[index % SHAPES.length],
    }));

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

    // Temporary placeholder collections: Nike images stand in for NdFeB, New Balance for ferrite.
    const collectionsData = useMemo(() => {
        const ndfeb = withPlaceholderShapes(shoes.filter((s) => s.brand === "Nike"));
        const newBalanceFull = shoes.filter(
            (s) => s.brand === "New Balance"
        );
        const newBalanceHalf = newBalanceFull.slice(0, Math.ceil(newBalanceFull.length / 2));
        const ferrite = withPlaceholderShapes([
            ...newBalanceHalf,
            ...newBalanceHalf.map((s, i) => ({
                ...s,
                product_url: `${s.product_url}-dup-${i}`,
            })),
        ]);
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
        rigState.activeId = null;
        // 3. Cleanup old layers after transition time
        setTimeout(() => {
            setGridLayers((prev) =>
                prev.filter((layer) => layer.mode === "enter")
            );
        }, CONFIG.cleanupTimeout);
    };
    const handleZoomTrigger = (target) => {
        if (target === "OUT") {
            setRigZoom(CONFIG.zoomOut);
            rigState.target.set(0, homeTargetY, 0);
        } else if (typeof target === "number") {
            setRigZoom(target);
        }
    };

    const handleShapeFilterChange = (filter) => {
        if (filter === shapeFilter) return;
        setShapeFilter(filter);
        rigState.activeId = null;
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
                />
                {/* Tech Background - geometric lines and crosshairs for CAD/architectural feel */}
                <TopologyBackground
                    isZoomedIn={isZoomedIn}
                    color={CONFIG.bgColor}
                    opacity={CONFIG.bgOpacity}
                    speed={CONFIG.bgSpeed}
                    scale={CONFIG.bgScale}
                    lineThickness={CONFIG.bgLineThickness}
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
