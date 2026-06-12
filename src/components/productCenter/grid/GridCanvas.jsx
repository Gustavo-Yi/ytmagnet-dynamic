import { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CONFIG } from "./gridConfig";
import { matchesFilter, calculateGridDimensions } from "./gridState";
import { ShoeTile } from "./ShoeTile";

// --- OPTIMIZED COMPONENT: GRID CANVAS ---
// Renders a single set of items with Time-Sliced mounting
export function GridCanvas({
    items,
    gridVisible,
    transitionStartTime,
    interactive,
    filter = "all",
    activeItemId = null,
    onActivateItem,
    onClearActiveItem,
}) {
    // Calculate filtered items and their new positions
    const { mappedItems, filteredGridDims } = useMemo(() => {
        const columnSpacing = CONFIG.itemSize + CONFIG.gap;
        const rowSpacing = CONFIG.itemSize + (CONFIG.rowGap ?? CONFIG.gap);
        const filteredItems = items.filter((item) =>
            matchesFilter(item, filter)
        );
        const filteredCount = filteredItems.length;
        const filteredDims =
            calculateGridDimensions(filteredCount);
        const maxDelay = gridVisible
            ? CONFIG.enterStaggerDelay
            : CONFIG.exitStaggerDelay;
        let filteredIdx = 0;
        const mapped = items.map((shoe, i) => {
            const matches = matchesFilter(shoe, filter);
            let targetPos;
            if (matches) {
                const col = filteredIdx % CONFIG.gridCols;
                const row = Math.floor(
                    filteredIdx / CONFIG.gridCols
                );
                targetPos = {
                    x:
                        col * columnSpacing -
                        filteredDims.width / 2 +
                        columnSpacing / 2,
                    y:
                        -(row * rowSpacing) +
                        filteredDims.height / 2 -
                        rowSpacing / 2,
                };
                filteredIdx++;
            } else {
                const col = i % CONFIG.gridCols;
                const row = Math.floor(i / CONFIG.gridCols);
                const originalDims = calculateGridDimensions(
                    items.length
                );
                targetPos = {
                    x:
                        col * columnSpacing -
                        originalDims.width / 2 +
                        columnSpacing / 2,
                    y:
                        -(row * rowSpacing) +
                        originalDims.height / 2 -
                        rowSpacing / 2,
                };
            }
            return {
                ...shoe,
                index: i,
                randomDelay: Math.random() * maxDelay,
                basePos: targetPos,
                matchesFilter: matches,
            };
        });
        return {
            mappedItems: mapped,
            filteredGridDims: filteredDims,
        };
    }, [items, filter, gridVisible]);
    // --- TIME-SLICED MOUNTING ---
    // Start with 0 items rendered for entering grids.
    // Every frame, add more items to prevent GPU texture upload spike.
    // If EXITING, render everything immediately (no need to stagger out).
    const [mountedCount, setMountedCount] = useState(
        gridVisible ? 0 : items.length
    );
    useFrame(() => {
        // 5 items per frame @ 60fps = ~12 frames (200ms) to load 60 items.
        // Fast enough to be invisible, slow enough to fix the lag.
        if (mountedCount < mappedItems.length) {
            setMountedCount((prev) =>
                Math.min(prev + 5, mappedItems.length)
            );
        }
    });
    return (
        <>
            {mappedItems.map((item, i) => {
                // Only render if within the mounted count
                if (i > mountedCount) return null;
                return (
                    <ShoeTile
                        key={item.product_url || item.index}
                        data={item}
                        index={item.index}
                        basePos={item.basePos}
                        gridVisible={gridVisible}
                        transitionStartTime={transitionStartTime}
                        interactive={interactive && item.matchesFilter}
                        matchesFilter={item.matchesFilter}
                        gridHeight={filteredGridDims.height}
                        activeItemId={activeItemId}
                        onActivateItem={onActivateItem}
                        onClearActiveItem={onClearActiveItem}
                    />
                );
            })}
        </>
    );
}
