import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { CONFIG } from "./gridConfig";
import { calculateVerticalTargetBounds, rigState } from "./gridState";

// --- COMPONENT: RIG ---
// Controls the camera. Moved OUT of GridCanvas so it is persistent.
export function Rig({ gridW, gridH, onClearActiveItem }) {
    const { camera, gl } = useThree();
    const prevPos = useRef(new THREE.Vector3());
    const getBounds = useCallback(() => {
        const dist = camera.position.z;
        const vFov = (camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
        const visibleWidth = visibleHeight * camera.aspect;
        const xLimit = Math.max(
            0,
            (gridW - visibleWidth) / 2 + 2
        );
        const yLimit = Math.max(
            0,
            (gridH - visibleHeight) / 2 + 2
        );
        const { minY, maxY } = calculateVerticalTargetBounds(
            gridH,
            visibleHeight
        );
        return { x: xLimit, y: yLimit, minY, maxY, visibleHeight };
    }, [camera, gridH, gridW]);

    useEffect(() => {
        const canvas = gl.domElement;
        let isDown = false;
        let startX = 0;
        let startY = 0;
        let initialRigX = 0;
        let initialRigY = 0;
        let maxDragDistance = 0; // Track max distance for click detection
        const onDown = (e) => {
            isDown = true;
            startX = e.clientX;
            startY = e.clientY;
            initialRigX = rigState.target.x;
            initialRigY = rigState.target.y;
            maxDragDistance = 0;
            rigState.isDragging = false; // Reset on new gesture
            canvas.style.cursor = "grabbing";
        };
        const onMove = (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            maxDragDistance = Math.max(maxDragDistance, distance);
            // Use higher threshold for mobile (touch is less precise)
            const threshold =
                "ontouchstart" in window
                    ? 15
                    : CONFIG.clickThreshold;
            if (maxDragDistance > threshold) {
                rigState.isDragging = true;
                if (rigState.activeId !== null) {
                    onClearActiveItem?.();
                }
            }
            const { x: bx, minY, maxY, visibleHeight } = getBounds();
            const sensitivity =
                (visibleHeight / window.innerHeight) *
                CONFIG.dragSpeed;
            let rawTargetX = initialRigX + dx * sensitivity;
            let rawTargetY = initialRigY - dy * sensitivity;
            // Apply resistance when dragging past bounds
            if (rawTargetX > bx)
                rawTargetX =
                    bx + (rawTargetX - bx) * CONFIG.dragResistance;
            if (rawTargetX < -bx)
                rawTargetX =
                    -bx + (rawTargetX + bx) * CONFIG.dragResistance;
            if (rawTargetY > maxY)
                rawTargetY =
                    maxY + (rawTargetY - maxY) * CONFIG.dragResistance;
            if (rawTargetY < minY)
                rawTargetY =
                    minY + (rawTargetY - minY) * CONFIG.dragResistance;
            // Hard limit on overshoot for snappier mobile feel
            const maxOvershoot = 3;
            rawTargetX = Math.max(
                -bx - maxOvershoot,
                Math.min(bx + maxOvershoot, rawTargetX)
            );
            rawTargetY = Math.max(
                minY - maxOvershoot,
                Math.min(maxY + maxOvershoot, rawTargetY)
            );
            rigState.target.set(rawTargetX, rawTargetY, 0);
        };
        const onUp = () => {
            if (!isDown) return; // Ignore spurious events
            isDown = false;
            rigState.isDragging = false;
            canvas.style.cursor = "grab";
            if (rigState.activeId !== null) return;
            const { x: bx, y: by, minY, maxY } = getBounds();
            // When zoomed out, keep the vertical wall position. When zoomed in, allow panning.
            const isZoomedOut =
                camera.position.z > CONFIG.zoomIn + 2;
            let snapX = isZoomedOut
                ? 0
                : Math.max(-bx, Math.min(bx, rigState.target.x));
            let snapY = isZoomedOut
                ? Math.max(minY, Math.min(maxY, rigState.target.y))
                : Math.max(-by, Math.min(by, rigState.target.y));
            rigState.target.set(snapX, snapY, 0);
        };
        const onWheel = (e) => {
            const isZoomedOut =
                camera.position.z > CONFIG.zoomIn + 2;

            if (!isZoomedOut || rigState.activeId !== null) return;

            e.preventDefault();
            const { minY, maxY, visibleHeight } = getBounds();
            const sensitivity =
                (visibleHeight / window.innerHeight) *
                CONFIG.wheelSpeed;
            const nextY = Math.max(
                minY,
                Math.min(maxY, rigState.target.y + e.deltaY * sensitivity)
            );

            rigState.target.set(0, nextY, 0);
        };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp); // Handle interrupted touch
        return () => {
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("wheel", onWheel);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
    }, [gl, camera, getBounds, onClearActiveItem]);

    useFrame((state, delta) => {
        easing.damp3(
            rigState.current,
            rigState.target,
            CONFIG.dampFactor,
            delta
        );
        easing.damp(
            camera.position,
            "z",
            rigState.zoom,
            CONFIG.zoomDamp,
            delta
        );
        rigState.velocity
            .copy(rigState.current)
            .sub(prevPos.current);
        prevPos.current.copy(rigState.current);
        const zoomFactor = Math.min(
            1,
            CONFIG.zoomIn / rigState.zoom
        );
        const tiltX =
            rigState.velocity.y * CONFIG.tiltFactor * zoomFactor;
        const tiltY =
            -rigState.velocity.x * CONFIG.tiltFactor * zoomFactor;
        easing.damp(camera.rotation, "x", tiltX, 0.2, delta);
        easing.damp(camera.rotation, "y", tiltY, 0.2, delta);
    });
    return null;
}
