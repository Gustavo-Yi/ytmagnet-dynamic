import { useEffect } from "react";
import { useControls } from "leva";
import { DEFAULT_CONFIG, CONFIG } from "./gridConfig";

const STORAGE_KEY = "ytmagnet_product_grid_config_wall_v5";

const CONTROL_KEYS = [
  "curvatureStrength",
  "rotationStrength",
  "focusScale",
  "dimScale",
  "dimOpacity",
  "dragSpeed",
  "dampFactor",
  "tiltFactor",
  "zoomIn",
  "zoomDamp",
  "zoomOut",
  "enterStartOpacity",
  "enterStartZ",
  "exitEndZ",
  "transitionZDamp",
  "enterOpacityDamp",
  "exitOpacityDamp",
  "enterStaggerDelay",
  "exitStaggerDelay",
  "cleanupTimeout",
  "exitSpreadY",
  "enterSpreadY",
  "transitionYDamp",
  "filterOpacityDamp",
  "bgColor",
  "bgOpacity",
  "bgSpeed",
  "bgScale",
  "bgLineThickness",
];

const getSavedConfig = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const getInitialValue = (savedConfig, key, fallback) =>
  savedConfig[key] ?? fallback;

const persistControls = (...groups) => {
  if (typeof window === "undefined") return;

  const nextConfig = {};
  groups.forEach((group) => {
    if (!group) return;
    CONTROL_KEYS.forEach((key) => {
      if (group[key] !== undefined) {
        nextConfig[key] = group[key];
      }
    });
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
};

// Hook to set up Leva controls and sync them to CONFIG
export function useGridConfig() {
  const savedConfig = getSavedConfig();

  // Controls for main config values
  const controls = useControls(
    "网格与镜头",
    {
      curvatureStrength: {
        value: getInitialValue(savedConfig, "curvatureStrength", DEFAULT_CONFIG.curvatureStrength),
        min: 0,
        max: 0.2,
        step: 0.001,
        label: "网格弯曲",
      },
      rotationStrength: {
        value: getInitialValue(savedConfig, "rotationStrength", DEFAULT_CONFIG.rotationStrength),
        min: 0,
        max: 5,
        step: 0.1,
        label: "朝向旋转",
      },
      focusScale: {
        value: getInitialValue(savedConfig, "focusScale", DEFAULT_CONFIG.focusScale),
        min: 1,
        max: 3,
        step: 0.1,
        label: "点击放大",
      },
      dimScale: {
        value: getInitialValue(savedConfig, "dimScale", DEFAULT_CONFIG.dimScale),
        min: 0,
        max: 1,
        step: 0.05,
        label: "非选中缩小",
      },
      dimOpacity: {
        value: getInitialValue(savedConfig, "dimOpacity", DEFAULT_CONFIG.dimOpacity),
        min: 0,
        max: 1,
        step: 0.05,
        label: "非选中透明度",
      },
      dragSpeed: {
        value: getInitialValue(savedConfig, "dragSpeed", DEFAULT_CONFIG.dragSpeed),
        min: 0.1,
        max: 3,
        step: 0.1,
        label: "拖拽速度",
      },
      dampFactor: {
        value: getInitialValue(savedConfig, "dampFactor", DEFAULT_CONFIG.dampFactor),
        min: 0.05,
        max: 0.5,
        step: 0.05,
        label: "移动缓动",
      },
      tiltFactor: {
        value: getInitialValue(savedConfig, "tiltFactor", DEFAULT_CONFIG.tiltFactor),
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "拖拽倾斜",
      },
      zoomIn: {
        value: getInitialValue(savedConfig, "zoomIn", DEFAULT_CONFIG.zoomIn),
        min: 5,
        max: 30,
        step: 1,
        label: "近景距离",
      },
      zoomDamp: {
        value: getInitialValue(savedConfig, "zoomDamp", DEFAULT_CONFIG.zoomDamp),
        min: 0.05,
        max: 0.5,
        step: 0.05,
        label: "缩放缓动",
      },
      zoomOut: {
        value: getInitialValue(savedConfig, "zoomOut", DEFAULT_CONFIG.zoomOut),
        min: 10,
        max: 100,
        step: 1,
        label: "远景距离",
      },
    },
    { collapsed: false, order: 0 }
  );
  // Animation controls

  const animationControls = useControls(
    "动画过渡",
    {
      enterStartOpacity: {
        value: getInitialValue(savedConfig, "enterStartOpacity", DEFAULT_CONFIG.enterStartOpacity),
        min: 0,
        max: 1,
        step: 0.05,
        label: "进入初始透明度",
      },
      enterStartZ: {
        value: getInitialValue(savedConfig, "enterStartZ", DEFAULT_CONFIG.enterStartZ),
        min: -50,
        max: 0,
        step: 1,
        label: "进入初始纵深",
      },
      exitEndZ: {
        value: getInitialValue(savedConfig, "exitEndZ", DEFAULT_CONFIG.exitEndZ),
        min: 0,
        max: 50,
        step: 1,
        label: "退出结束纵深",
      },
      transitionZDamp: {
        value: getInitialValue(savedConfig, "transitionZDamp", DEFAULT_CONFIG.transitionZDamp),
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "纵深缓动",
      },
      enterOpacityDamp: {
        value: getInitialValue(savedConfig, "enterOpacityDamp", DEFAULT_CONFIG.enterOpacityDamp),
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "进入透明缓动",
      },
      exitOpacityDamp: {
        value: getInitialValue(savedConfig, "exitOpacityDamp", DEFAULT_CONFIG.exitOpacityDamp),
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "退出透明缓动",
      },
      enterStaggerDelay: {
        value: getInitialValue(savedConfig, "enterStaggerDelay", DEFAULT_CONFIG.enterStaggerDelay),
        min: 0,
        max: 2000,
        step: 50,
        label: "进入错峰延迟",
      },
      exitStaggerDelay: {
        value: getInitialValue(savedConfig, "exitStaggerDelay", DEFAULT_CONFIG.exitStaggerDelay),
        min: 0,
        max: 1000,
        step: 50,
        label: "退出错峰延迟",
      },
      cleanupTimeout: {
        value: getInitialValue(savedConfig, "cleanupTimeout", DEFAULT_CONFIG.cleanupTimeout),
        min: 500,
        max: 3000,
        step: 100,
        label: "清理等待时间",
      },
      exitSpreadY: {
        value: getInitialValue(savedConfig, "exitSpreadY", DEFAULT_CONFIG.exitSpreadY),
        min: 0,
        max: 10,
        step: 0.5,
        label: "退出纵向散开",
      },
      enterSpreadY: {
        value: getInitialValue(savedConfig, "enterSpreadY", DEFAULT_CONFIG.enterSpreadY),
        min: 0,
        max: 10,
        step: 0.5,
        label: "进入纵向散开",
      },
      transitionYDamp: {
        value: getInitialValue(savedConfig, "transitionYDamp", DEFAULT_CONFIG.transitionYDamp),
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "纵向缓动",
      },
      filterOpacityDamp: {
        value: getInitialValue(savedConfig, "filterOpacityDamp", DEFAULT_CONFIG.filterOpacityDamp),
        min: 0.01,
        max: 0.3,
        step: 0.01,
        label: "筛选淡出速度",
      },
    },
    { collapsed: false, order: 1 }
  );

  // TopologyBackground controls
  const techBgControls = useControls(
    "背景线条",
    {
      bgColor: {
        value: getInitialValue(savedConfig, "bgColor", "#e0e0e0"),
        label: "线条颜色",
      },
      bgOpacity: {
        value: getInitialValue(savedConfig, "bgOpacity", 0.4),
        min: 0,
        max: 1,
        step: 0.05,
        label: "线条透明度",
      },
      bgSpeed: {
        value: getInitialValue(savedConfig, "bgSpeed", 0.05),
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "流动速度",
      },
      bgScale: {
        value: getInitialValue(savedConfig, "bgScale", 3.0),
        min: 1,
        max: 10,
        step: 0.5,
        label: "线条密度",
      },
      bgLineThickness: {
        value: getInitialValue(savedConfig, "bgLineThickness", 0.03),
        min: 0.01,
        max: 0.1,
        step: 0.01,
        label: "线条粗细",
      },
    },
    { collapsed: false, order: 2 }
  );

  // Update CONFIG object when controls change
  useEffect(() => {
    if (controls) {
      CONFIG.curvatureStrength =
        controls.curvatureStrength ??
        DEFAULT_CONFIG.curvatureStrength;
      CONFIG.rotationStrength =
        controls.rotationStrength ??
        DEFAULT_CONFIG.rotationStrength;
      CONFIG.fogNear =
        controls.fogNear ?? DEFAULT_CONFIG.fogNear;
      CONFIG.fogFar =
        controls.fogFar ?? DEFAULT_CONFIG.fogFar;
      CONFIG.focusScale =
        controls.focusScale ?? DEFAULT_CONFIG.focusScale;
      CONFIG.dimScale =
        controls.dimScale ?? DEFAULT_CONFIG.dimScale;
      CONFIG.dimOpacity =
        controls.dimOpacity ?? DEFAULT_CONFIG.dimOpacity;
      CONFIG.dragSpeed =
        controls.dragSpeed ?? DEFAULT_CONFIG.dragSpeed;
      CONFIG.dampFactor =
        controls.dampFactor ?? DEFAULT_CONFIG.dampFactor;
      CONFIG.tiltFactor =
        controls.tiltFactor ?? DEFAULT_CONFIG.tiltFactor;
      CONFIG.zoomIn =
        controls.zoomIn ?? DEFAULT_CONFIG.zoomIn;
      CONFIG.zoomDamp =
        controls.zoomDamp ?? DEFAULT_CONFIG.zoomDamp;
      CONFIG.zoomOut =
        controls.zoomOut ?? DEFAULT_CONFIG.zoomOut;
    }
    if (animationControls) {
      CONFIG.enterStartOpacity =
        animationControls.enterStartOpacity ??
        DEFAULT_CONFIG.enterStartOpacity;
      CONFIG.enterStartZ =
        animationControls.enterStartZ ??
        DEFAULT_CONFIG.enterStartZ;
      CONFIG.exitEndZ =
        animationControls.exitEndZ ??
        DEFAULT_CONFIG.exitEndZ;
      CONFIG.transitionZDamp =
        animationControls.transitionZDamp ??
        DEFAULT_CONFIG.transitionZDamp;
      CONFIG.enterOpacityDamp =
        animationControls.enterOpacityDamp ??
        DEFAULT_CONFIG.enterOpacityDamp;
      CONFIG.exitOpacityDamp =
        animationControls.exitOpacityDamp ??
        DEFAULT_CONFIG.exitOpacityDamp;
      CONFIG.enterStaggerDelay =
        animationControls.enterStaggerDelay ??
        DEFAULT_CONFIG.enterStaggerDelay;
      CONFIG.exitStaggerDelay =
        animationControls.exitStaggerDelay ??
        DEFAULT_CONFIG.exitStaggerDelay;
      CONFIG.cleanupTimeout =
        animationControls.cleanupTimeout ??
        DEFAULT_CONFIG.cleanupTimeout;
      CONFIG.exitSpreadY =
        animationControls.exitSpreadY ??
        DEFAULT_CONFIG.exitSpreadY;
      CONFIG.enterSpreadY =
        animationControls.enterSpreadY ??
        DEFAULT_CONFIG.enterSpreadY;
      CONFIG.transitionYDamp =
        animationControls.transitionYDamp ??
        DEFAULT_CONFIG.transitionYDamp;
      CONFIG.filterOpacityDamp =
        animationControls.filterOpacityDamp ??
        DEFAULT_CONFIG.filterOpacityDamp;
    }
    if (techBgControls) {
      CONFIG.bgColor = techBgControls.bgColor ?? "#e0e0e0";
      CONFIG.bgOpacity = techBgControls.bgOpacity ?? 0.4;
      CONFIG.bgSpeed = techBgControls.bgSpeed ?? 0.05;
      CONFIG.bgScale = techBgControls.bgScale ?? 3.0;
      CONFIG.bgLineThickness =
        techBgControls.bgLineThickness ?? 0.03;
    }
    persistControls(controls, animationControls, techBgControls);
  }, [controls, animationControls, techBgControls]);

  return controls;
}
