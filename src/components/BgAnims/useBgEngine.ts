import { useRef } from "react";
import { RandomPathsItem } from "./Interfaces/Interfaces";
import { RandomPathsAdvCfg } from "./Interfaces/Interfaces";
import { MatrixColumnItem } from "./Interfaces/Interfaces";

// Engine hook providing shared functionality for multiple animated backgrounds
export default function useTechStackEngine() {
  //=============
  // CORE REFS ==
  //=============

  // Tracks virtual simulation time
  const simTimeRef = useRef(0);
  // Stores last real timestamp
  const lastRealTimeRef = useRef<number | null>(null);
  // Reference to canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Stores canvas size
  const sizeRef = useRef({ w: 0, h: 0 });
  // Holds current RAF id
  const rafRef = useRef<number | null>(null);

  //====================
  // PERFORMANCE REFS ==
  //====================

  // Last spawn timestamp
  const lastAddRef = useRef<number>(0);
  // Total frames rendered
  const frameCountRef = useRef<number>(0);
  // Smoothed frame duration
  const avgFrameMsRef = useRef<number>(0);
  // Adjusts spawn rate dynamically
  const spawnMultiplierRef = useRef<number>(0);
  // Frame skipping factor
  const drawEveryNRef = useRef<number>(0);

  //=============
  // UTILITIES ==
  //=============

  // Generate a unique ID for each column/path
  const generateId = () => {
    return (
      (typeof crypto !== "undefined" && (crypto as any).randomUUID?.()) ??
      Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
  };

  // gives random number in pointed range
  const getRndNmb = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  // Adjust canvas size to viewport while handling device pixel ratio
  const handleResize = (
    canvas: HTMLCanvasElement | null,
    sizeRef: React.MutableRefObject<{ w: number; h: number }>,
  ) => {
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Limit device pixel ratio to 2 for performance
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.floor(window.visualViewport?.width ?? window.innerWidth);
    const h = Math.floor(window.visualViewport?.height ?? window.innerHeight);

    sizeRef.current = { w, h };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Scale drawing context to account for DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineCap = "round"; // Line end style
    ctx.lineJoin = "bevel"; // Corner style for connected lines
  };

  //======================
  // ADAPTIVE RENDERING ==
  //======================
  const adaptRendering = (
    dt: number,
    cfg: RandomPathsAdvCfg,
    frameCountRef: React.MutableRefObject<number>,
    avgFrameMsRef: React.MutableRefObject<number>,
    drawEveryNRef: React.MutableRefObject<number>,
    spawnMultiplierRef: React.MutableRefObject<number>,
  ) => {
    // Count frames
    frameCountRef.current += 1;

    // Smooth average frame time with exponential moving average
    avgFrameMsRef.current =
      avgFrameMsRef.current * (1 - cfg.avgFrameMsAlpha!) +
      dt * cfg.avgFrameMsAlpha!;

    // Adjust frame skipping and spawn multiplier according to performance
    if (avgFrameMsRef.current > cfg.drawEveryNThresholds![1]) {
      drawEveryNRef.current = cfg.drawEveryNValues![2];
      spawnMultiplierRef.current = cfg.spawnMultiplierValues![2];
    } else if (avgFrameMsRef.current > cfg.drawEveryNThresholds![0]) {
      drawEveryNRef.current = cfg.drawEveryNValues![1];
      spawnMultiplierRef.current = cfg.spawnMultiplierValues![1];
    } else {
      drawEveryNRef.current = cfg.drawEveryNValues![0];
      spawnMultiplierRef.current = cfg.spawnMultiplierValues![0];
    }

    // Decide if current frame should actually be rendered
    const shouldDrawThisFrame =
      frameCountRef.current % drawEveryNRef.current === 0;

    return { dt, shouldDrawThisFrame };
  };

  //=========================
  // SPAWN CONTROL ==========
  //=========================
  const spawnIfNeeded = (
    simNow: number,
    active: RandomPathsItem[] | MatrixColumnItem[],
    targetFrameBudget: number | undefined,
    interval: number,
    maxActive: number,
  ) => {
    // Scale interval based on average frame cost
    const multiplier = Math.min(
      4,
      Math.max(1, Math.round(avgFrameMsRef.current / targetFrameBudget!)),
    );
    const effectiveInterval =
      interval * multiplier * spawnMultiplierRef.current;

    // Prevent spawn if interval not reached or max active exceeded
    if (simNow - lastAddRef.current < effectiveInterval) return false;
    if (active.length >= maxActive) return false;

    return true;
  };

  //RETURN API
  return {
    simTimeRef,
    lastRealTimeRef,

    canvasRef,
    sizeRef,

    rafRef,

    lastAddRef,
    frameCountRef,
    avgFrameMsRef,
    spawnMultiplierRef,
    drawEveryNRef,

    generateId,
    getRndNmb,
    handleResize,
    adaptRendering,
    spawnIfNeeded,
  };
}
