import * as THREE from "three";
import { CONFIG } from "./gridConfig";

// --- GLOBAL STATE ---
export const rigState = {
    target: new THREE.Vector3(0, CONFIG.restingY, 0),
    current: new THREE.Vector3(0, CONFIG.restingY, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    zoom: CONFIG.zoomOut,
    isDragging: false,
    activeId: null,
};

export const setRigZoom = (zoom) => {
    rigState.zoom = zoom;
};

// --- HELPER: Grid Dimensions ---
export const calculateGridDimensions = (count) => {
    const rows = Math.ceil(count / CONFIG.gridCols);
    const columnSpacing = CONFIG.itemSize + CONFIG.gap;
    const rowSpacing = CONFIG.itemSize + (CONFIG.rowGap ?? CONFIG.gap);
    return {
        width: CONFIG.gridCols * columnSpacing,
        height: rows * rowSpacing,
    };
};

export const calculateGridHomeTargetY = (
    count,
    visibleHeight = 2 * Math.tan((45 * Math.PI) / 360) * CONFIG.zoomOut
) => {
    const gridDims = calculateGridDimensions(count);
    const rowSpacing = CONFIG.itemSize + (CONFIG.rowGap ?? CONFIG.gap);

    if (count <= 0 || gridDims.height <= 0) {
        return CONFIG.restingY;
    }

    const topRowY = gridDims.height / 2 - rowSpacing / 2;
    return visibleHeight / 2 - CONFIG.wallTopInset - topRowY;
};

export const calculateVerticalTargetBounds = (gridH, visibleHeight) => {
    const rowSpacing = CONFIG.itemSize + (CONFIG.rowGap ?? CONFIG.gap);

    if (gridH <= 0) {
        return {
            minY: CONFIG.restingY,
            maxY: CONFIG.restingY,
        };
    }

    const topRowY = gridH / 2 - rowSpacing / 2;
    const bottomRowY = -gridH / 2 + rowSpacing / 2;
    const minY = visibleHeight / 2 - CONFIG.wallTopInset - topRowY;
    const maxY = -visibleHeight / 2 + CONFIG.wallBottomInset - bottomRowY;

    return {
        minY,
        maxY: Math.max(minY, maxY),
    };
};

// --- HELPER: Check if item matches filter ---
export const matchesFilter = (item, filter) => {
    if (filter !== "all") {
        return item.shape === filter;
    }

    return true;
};
