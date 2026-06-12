import React, {
    useRef,
    useMemo,
    useState,
    useLayoutEffect,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { CONFIG } from "./gridConfig";
import { rigState, setRigZoom } from "./gridState";
import { CloseButton } from "../CloseButton";

const getImageContentBounds = (image) => {
    if (typeof document === "undefined" || !image) return null;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return null;

    const sampleSize = 96;
    const scale = Math.min(1, sampleSize / Math.max(width, height));
    const canvasWidth = Math.max(1, Math.round(width * scale));
    const canvasHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    try {
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
        const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
        let minX = canvasWidth;
        let minY = canvasHeight;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const alpha = data[(y * canvasWidth + x) * 4 + 3];
                if (alpha > 12) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (maxX < 0 || maxY < 0) return null;
        return {
            left: minX / canvasWidth,
            top: minY / canvasHeight,
            right: (maxX + 1) / canvasWidth,
            bottom: (maxY + 1) / canvasHeight,
        };
    } catch {
        return null;
    }
};

const formatMmValue = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return null;
    return Number.isInteger(numberValue)
        ? String(numberValue)
        : String(Number(numberValue.toFixed(2)));
};

const formatSizeLabel = (item) => {
    const diameter = formatMmValue(item.diameterMm);
    const thickness = formatMmValue(item.thicknessMm);

    if (diameter && thickness) {
        return `${diameter} \u00d7 ${thickness} mm`;
    }

    return item.title?.replace(/mm$/i, " mm") ?? "";
};

// --- OPTIMIZED COMPONENT: SHOE TILE ---
export function ShoeTile({
    data,
    index,
    basePos,
    gridVisible,
    transitionStartTime,
    interactive,
    matchesFilter = true,
    sizeLabelOffsetY = CONFIG.sizeLabelOffsetY,
    gridHeight,
    activeItemId = null,
    onActivateItem,
    onClearActiveItem,
}) {
    const ref = useRef();
    const imageRef = useRef();
    const sizeLabelRef = useRef();
    const [hovered, setHovered] = useState(false);
    const texture = useTexture(data.image_url);
    // Animation Refs
    const focusZ = useRef(0);
    const rotationX = useRef(0);
    const rotationY = useRef(0);
    const curveZ = useRef(0);
    const transitionZ = useRef(0);
    const transitionY = useRef(0);
    // Animated position for filter transitions
    const animatedPos = useRef({
        x: basePos.x,
        y: basePos.y,
    });
    const initialBaseY = useRef(basePos.y);
    const initialGridHeight = useRef(gridHeight);
    const initialGridVisible = useRef(gridVisible);
    const filterOpacity = useRef(1);
    const filterScale = useRef(1);
    const sizeLabelOpacity = useRef(0);
    // State to track if we should stop processing entirely (optimization)
    const isSleep = useRef(false);
    // Track if this item was dimmed due to focus mode (for fast recovery)
    const wasDimmedByFocus = useRef(false);
    // RESET ANIMATION STATE ON MOUNT

    useLayoutEffect(() => {
        const startingGridHeight = initialGridHeight.current;
        const normalizedY =
            startingGridHeight > 0
                ? initialBaseY.current / (startingGridHeight / 2)
                : 0;
        if (initialGridVisible.current) {
            transitionZ.current = CONFIG.enterStartZ;
            transitionY.current =
                normalizedY * CONFIG.enterSpreadY;
            if (imageRef.current)
                imageRef.current.material.uOpacity =
                    CONFIG.enterStartOpacity;
            isSleep.current = false;
        } else {
            transitionZ.current = 0;
            transitionY.current = 0;
            if (imageRef.current)
                imageRef.current.material.uOpacity = 1;
        }
    }, []);
    const imageDims = useMemo(() => {
        const maxSize =
            CONFIG.itemSize * 0.9 * (data.displayScale ?? 1);
        if (!texture.image)
            return { width: maxSize, height: maxSize };
        const imgAspect =
            texture.image.width / texture.image.height;
        return imgAspect > 1
            ? { width: maxSize, height: maxSize / imgAspect }
            : { width: maxSize * imgAspect, height: maxSize };
    }, [texture, data.displayScale]);
    const contentBounds = useMemo(
        () => getImageContentBounds(texture.image),
        [texture.image]
    );
    const previewScale = useMemo(() => {
        const physicalScale = data.displayScale ?? 1;
        const minReadableScale = 0.35;
        const focusBoost =
            physicalScale > 0
                ? Math.max(1, minReadableScale / physicalScale)
                : 1;
        return CONFIG.focusScale * focusBoost;
    }, [data.displayScale]);
    const { closeButtonPosition, activeSizeLabelPosition } = useMemo(() => {
        const fallbackRight = imageDims.width / 2;
        const fallbackTop = imageDims.height / 2;
        const fallbackBottom = -imageDims.height / 2;
        const contentRight = contentBounds
            ? (contentBounds.right - 0.5) * imageDims.width
            : fallbackRight;
        const contentTop = contentBounds
            ? (0.5 - contentBounds.top) * imageDims.height
            : fallbackTop;
        const contentBottom = contentBounds
            ? (0.5 - contentBounds.bottom) * imageDims.height
            : fallbackBottom;
        const safePreviewScale = Math.max(previewScale, 0.001);

        return {
            closeButtonPosition: [
                contentRight + CONFIG.previewCloseGap / safePreviewScale,
                contentTop + CONFIG.previewCloseGap / safePreviewScale,
                0.12,
            ],
            activeSizeLabelPosition: [
                0,
                contentBottom -
                    CONFIG.previewSizeLabelGap / safePreviewScale,
                0.12,
            ],
        };
    }, [contentBounds, imageDims, previewScale]);
    const sizeLabel = useMemo(() => formatSizeLabel(data), [data]);
    const hitAreaDims = useMemo(() => {
        const minHitSize = CONFIG.itemSize * 0.82;
        return {
            width: Math.max(imageDims.width * 1.1, minHitSize),
            height: Math.max(imageDims.height * 1.1, minHitSize),
        };
    }, [imageDims]);
    useFrame((state, delta) => {
        // OPTIMIZATION 1: If sleeping or ref missing, stop immediately.
        if (!ref.current || isSleep.current) return;
        // --- 0. Filter Animation ---
        easing.damp(
            animatedPos.current,
            "x",
            basePos.x,
            0.2,
            delta
        );
        easing.damp(
            animatedPos.current,
            "y",
            basePos.y,
            0.2,
            delta
        );
        const targetFilterOpacity = matchesFilter ? 1 : 0;
        const targetFilterScale = matchesFilter ? 1 : CONFIG.filterScaleTarget;
        easing.damp(
            filterOpacity,
            "current",
            targetFilterOpacity,
            CONFIG.filterOpacityDamp,
            delta
        );
        easing.damp(
            filterScale,
            "current",
            targetFilterScale,
            CONFIG.filterOpacityDamp,
            delta
        );
        // Sleep check: If filtered out and visually invisible, stop processing
        // Check actual material opacity, not filterOpacity ref, to avoid popping
        const actualOpacity = imageRef.current?.material?.uOpacity ?? 1;
        if (actualOpacity < 0.01 && !matchesFilter) {
            ref.current.visible = false;
            return;
        }
        // --- 1. Stagger Logic ---
        const now = Date.now();
        const timeSinceTrigger = now - transitionStartTime;
        const staggerDelay = data.randomDelay || 0;
        const canTransition = timeSinceTrigger > staggerDelay;

        // --- 2. Calculate Targets ---
        let targetTransitionOpacity = 1.0;
        let targetTransitionZ = 0;
        const normalizedY =
            gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;
        let targetTransitionY = 0;
        if (gridVisible) {
            // ENTERING
            if (canTransition) {
                targetTransitionOpacity = 1.0;
                targetTransitionZ = 0;
                targetTransitionY = 0;
            } else {
                targetTransitionOpacity = CONFIG.enterStartOpacity;
                targetTransitionZ = CONFIG.enterStartZ;
                targetTransitionY =
                    normalizedY * CONFIG.enterSpreadY;
            }
        } else {
            // EXITING
            if (canTransition) {
                targetTransitionOpacity = 0.0;
                targetTransitionZ = CONFIG.exitEndZ;
                targetTransitionY =
                    normalizedY * CONFIG.exitSpreadY;
            } else {
                targetTransitionOpacity = 1.0;
                targetTransitionZ = 0;
                targetTransitionY = 0;
            }
        }
        // --- 3. Base Position ---
        const x = animatedPos.current.x + rigState.current.x;
        const y = animatedPos.current.y + rigState.current.y;
        // --- 4. Dynamic Culling ---
        const currentCull =
            CONFIG.cullDistance * (rigState.zoom / 8);
        const isPositionVisible =
            Math.abs(x) < currentCull &&
            Math.abs(y) < currentCull;
        // OPTIMIZATION 2: Strict Visibility Culling
        // If exiting and invisible, stop running this loop forever
        if (
            !gridVisible &&
            targetTransitionOpacity < 0.01 &&
            filterOpacity.current < 0.01
        ) {
            ref.current.visible = false;
            isSleep.current = true;
            return;
        }
        // Standard view culling
        if (
            !isPositionVisible &&
            !(!gridVisible && canTransition)
        ) {
            ref.current.visible = false;
            return;
        }
        // If opacity is effectively 0, hide mesh to save GPU rasterization
        if (
            imageRef.current?.material.uOpacity < 0.01 &&
            targetTransitionOpacity < 0.01
        ) {
            ref.current.visible = false;
            return;
        }
        ref.current.visible = true;
        // --- 5. Curvature & Zoom ---
        const isZoomedIn = rigState.zoom <= CONFIG.zoomIn + 0.5;
        const maxZoom = CONFIG.zoomOut || 50;
        const zoomRatio = isZoomedIn
            ? 0
            : THREE.MathUtils.clamp(
                (rigState.zoom - CONFIG.zoomIn) /
                (maxZoom - CONFIG.zoomIn),
                0,
                1
            );
        const smoothRatio = easing.cubic.inOut(zoomRatio);
        const distSq = x * x + y * y;
        const dist = Math.sqrt(distSq);
        const targetCurveZ =
            -distSq * CONFIG.curvatureStrength * smoothRatio;
        // Optimization: Skip complex rotation math if fading out
        let rotX = 0,
            rotY = 0;
        if (targetTransitionOpacity > 0.1) {
            const rotationIntensity =
                Math.min(dist * 0.4, 2.0) * smoothRatio;
            rotX =
                y *
                CONFIG.curvatureStrength *
                CONFIG.rotationStrength *
                rotationIntensity;
            rotY =
                -x *
                CONFIG.curvatureStrength *
                CONFIG.rotationStrength *
                rotationIntensity;
        }
        // --- 6. Interaction State ---
        const isFocusMode = rigState.activeId !== null;
        const isActive = rigState.activeId === index;
        const isHovered = hovered && interactive;
        let interactionScale = 1.0;
        let interactionOpacity = 1.0;
        let targetFocusZ = 0;
        if (isFocusMode) {
            if (isActive) {
                const physicalScale = data.displayScale ?? 1;
                const minReadableScale = 0.35;
                const focusBoost =
                    physicalScale > 0
                        ? Math.max(1, minReadableScale / physicalScale)
                        : 1;
                interactionScale = CONFIG.focusScale * focusBoost;
                interactionOpacity = 1.0;
                targetFocusZ = 2;
            } else {
                interactionScale = CONFIG.dimScale;
                interactionOpacity = CONFIG.dimOpacity;
                targetFocusZ = -0.5;
                // Track that this item was dimmed
                wasDimmedByFocus.current = true;
            }
        } else {
            interactionScale =
                isHovered && !rigState.isDragging ? 1.05 : 1.0;
            targetFocusZ =
                isHovered && !rigState.isDragging ? 0.5 : 0;
        }
        const finalOpacity =
            interactionOpacity *
            targetTransitionOpacity *
            filterOpacity.current;
        const combinedScale =
            interactionScale * filterScale.current;
        const farLabelVisibility = THREE.MathUtils.smoothstep(
            zoomRatio,
            0.32,
            0.68
        );
        const targetSizeLabelOpacity =
            isActive
                ? finalOpacity
                : !isFocusMode && targetTransitionOpacity >= 0.8
                ? finalOpacity * farLabelVisibility
                : 0;
        // --- 7. Apply Animations ---
        easing.damp(
            ref.current.scale,
            "x",
            combinedScale,
            0.15,
            delta
        );
        easing.damp(
            ref.current.scale,
            "y",
            combinedScale,
            0.15,
            delta
        );
        easing.damp(
            focusZ,
            "current",
            targetFocusZ,
            0.2,
            delta
        );
        easing.damp(
            curveZ,
            "current",
            targetCurveZ,
            0.2,
            delta
        );
        easing.damp(
            transitionZ,
            "current",
            targetTransitionZ,
            CONFIG.transitionZDamp,
            delta
        );
        easing.damp(
            transitionY,
            "current",
            targetTransitionY,
            CONFIG.transitionYDamp,
            delta
        );
        ref.current.position.set(
            x,
            y + transitionY.current,
            curveZ.current + focusZ.current + transitionZ.current
        );
        easing.damp(rotationX, "current", rotX, 0.2, delta);
        easing.damp(rotationY, "current", rotY, 0.2, delta);
        ref.current.rotation.set(
            rotationX.current,
            rotationY.current,
            0
        );
        if (imageRef.current) {
            // Update shader uniforms
            imageRef.current.material.uTime =
                state.clock.elapsedTime;
            // Smoothly animate active state for shader effects
            const isActive = rigState.activeId === index;
            const activeDamp = isActive ? 0.6 : 0.15; // Slow open, fast close
            easing.damp(
                imageRef.current.material,
                "uActive",
                isActive ? 1 : 0,
                activeDamp,
                delta
            );
            // Animate opacity via shader uniform
            // Use faster damp for filter transitions and focus recovery, slower for grid enter/exit
            let opacityDamp;
            const isFilterTransition = !matchesFilter || filterOpacity.current < 0.99;
            // Focus recovery: item was dimmed and is now recovering
            const isFocusRecovery = !isFocusMode && wasDimmedByFocus.current;
            if (isFilterTransition && gridVisible) {
                // Filtering in or out - use filter damp for faster fade
                opacityDamp = CONFIG.filterOpacityDamp;
            } else if (isFocusRecovery && gridVisible) {
                // Recovering from dimmed state after deselection - use faster damp
                opacityDamp = CONFIG.filterOpacityDamp;
                // Reset flag once opacity is recovered
                if (imageRef.current.material.uOpacity > 0.95) {
                    wasDimmedByFocus.current = false;
                }
            } else if (gridVisible) {
                opacityDamp = CONFIG.enterOpacityDamp;
            } else {
                opacityDamp = CONFIG.exitOpacityDamp;
            }
            easing.damp(
                imageRef.current.material,
                "uOpacity",
                finalOpacity,
                opacityDamp,
                delta
            );
        }
        if (sizeLabelRef.current) {
            easing.damp(
                sizeLabelOpacity,
                "current",
                targetSizeLabelOpacity,
                0.12,
                delta
            );
            sizeLabelRef.current.style.opacity =
                sizeLabelOpacity.current.toFixed(3);
        }
    });

    const handleClick = (e) => {
        if (!interactive) return;
        if (rigState.isDragging) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        if (activeItemId === index) {
            onClearActiveItem?.();
        } else {
            const isZoomedOut = rigState.zoom > CONFIG.zoomIn + 2;
            rigState.target.set(-basePos.x, -basePos.y, 0);
            if (isZoomedOut) {
                onActivateItem?.(index);
                setRigZoom(CONFIG.zoomIn);
            } else {
                onActivateItem?.(index);
            }
        }
    };
    const isActive = gridVisible && activeItemId === index;
    const sizeLabelPosition = isActive
        ? activeSizeLabelPosition
        : [0, sizeLabelOffsetY, 0.08];

    return (
        <group ref={ref}>
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={handleClick}
            >
                <planeGeometry
                    args={[
                        hitAreaDims.width,
                        hitAreaDims.height,
                    ]}
                />
                <meshBasicMaterial visible={false} />
            </mesh>
            <mesh ref={imageRef}>
                <planeGeometry
                    args={[imageDims.width, imageDims.height, 16, 16]}
                />
                <holoCardMaterial
                    transparent={true}
                    uTexture={texture}
                />
            </mesh>
            {/* OPTIMIZATION 3: CONDITIONAL TEXT RENDERING */}
            {/* Do NOT render text if the grid is exiting. Saves massive CPU overhead. */}
            {gridVisible && (
                <>
                    {sizeLabel && (
                        <Html
                            position={sizeLabelPosition}
                            center
                            zIndexRange={[95, 91]}
                            style={{ pointerEvents: "none" }}
                        >
                            <div
                                ref={sizeLabelRef}
                                className="product-size-label"
                            >
                                {sizeLabel}
                            </div>
                        </Html>
                    )}
                </>
            )}
            <CloseButton
                isActive={isActive}
                position={closeButtonPosition}
                onClose={() => {
                    onClearActiveItem?.();
                }}
            />
        </group>
    );
}
