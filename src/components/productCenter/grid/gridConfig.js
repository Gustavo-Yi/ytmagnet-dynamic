// --- CONFIGURATION ---
// Default values - will be overridden by controls
export const DEFAULT_CONFIG = {
  gridCols: 6,
  itemSize: 5,
  gap: 2,
  rowGap: 4.2,

  // Physics
  dragSpeed: 2.2,
  wheelSpeed: 1.8,
  dampFactor: 0.2,
  tiltFactor: 0,
  clickThreshold: 5,
  dragResistance: 0.25,

  // Camera / Zoom
  zoomIn: 12,
  zoomOut: 40,
  restingY: -0.45,
  wallTopInset: 5.7,
  wallBottomInset: 7,
  zoomDamp: 0.25,

  // Visuals
  focusScale: 1.6,
  dimScale: 0.5,
  dimOpacity: 0.15,
  sizeLabelOffsetY: -1.22,
  sizeLabelScaleOffsetY: 1.45,
  previewCloseGap: 0.3,
  previewSizeLabelGap: 0.38,

  // 3D Curvature Effect
  curvatureStrength: 0, // Keep the product grid flat and rectilinear.
  rotationStrength: 0, // How much tiles rotate to face center

  // Culling
  cullDistance: 14,

  // Minimap
  mapWidth: 120,
  mapDotSize: 2,

  // Fog
  fogNear: 19,
  fogFar: 100,

  // Animation
  enterStartOpacity: 0.0,
  enterStartZ: -50,
  exitEndZ: 20,
  transitionZDamp: 0.25,
  enterOpacityDamp: 0.85,
  exitOpacityDamp: 0.15,
  enterStaggerDelay: 400,
  exitStaggerDelay: 300,
  cleanupTimeout: 700,
  exitSpreadY: 0.5, // How far top/bottom items spread vertically when exiting
  enterSpreadY: 1, // How far items start spread when entering (then settle to 0)
  transitionYDamp: 0.08, // Y spread animates faster than Z (lower = faster)
  filterOpacityDamp: 0.06, // Filter fade out (lower = faster, used when filtering within collection)
  filterScaleTarget: 0.5, // Scale target when filtered out (smaller = more dramatic shrink)

  // Tech Background
  bgColor: "#e0e0e0",
  bgOpacity: 0.4,
  bgSpeed: 0.05,
  bgScale: 3.0,
  bgLineThickness: 0.03,
};

// Create a ref to hold the current config so it can be updated
export let CONFIG = { ...DEFAULT_CONFIG };

// Initialize CONFIG with defaults
Object.assign(CONFIG, DEFAULT_CONFIG);
