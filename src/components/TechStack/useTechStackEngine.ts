import { TechStackEnginePropsInterface } from "./Interfaces/Interfaces";

import config from "../../data/techStack/config.json";

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";

import useFontsLoaded from "../Utilities/useFontsLoaded";
import useImagesLoaded from "../Utilities/useImagesLoaded";

//=======================
//About Engine ==========
//=======================

//this file is interaction engine / controller
//outside of render component to make it "cleaner"
//all stuff here is used in TechStack component

export default function useTechStackEngine({
  zoomRange = { min: 0.5, max: 2.5 },
  spacingMult = 50,
  buildMode,
  setFreeze,
}: TechStackEnginePropsInterface) {
  //=======================
  //Build Mode (Dev Only) =
  //=======================

  /*
    The BuildMode is simple solution to effectively help me position techstack elements
    without code tons of algorythms, that won't check every edge case anyway or
    code values directly inside component.
    */

  //buildmode is passed as prop

  //we generate config, copy it and paste inside config.json
  //in data folder, overwriting it completely

  // Copy current element positions + calculated bounds to clipboard
  const copyLayoutConfig = async () => {
    const { minX, minY, maxX, maxY } = Object.entries(elementPositions).reduce(
      (layoutBounds, [id, pos]) => {
        const el = document.querySelector(
          `[data-id="${id}"]`,
        ) as HTMLElement | null;
        if (!el) return layoutBounds;

        // convert element size to world space (accounting for zoom scale)
        const width = el.clientWidth / scale;
        const height = el.clientHeight / scale;

        return {
          minX: Math.min(layoutBounds.minX, Math.trunc(pos.x)),
          minY: Math.min(layoutBounds.minY, Math.trunc(pos.y)),
          maxX: Math.max(layoutBounds.maxX, Math.trunc(pos.x + width)),
          maxY: Math.max(layoutBounds.maxY, Math.trunc(pos.y + height)),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

    const cfg = {
      elements: elementPositions,
      translateLimits: { minX, maxX, minY, maxY },
    };

    const pretty = JSON.stringify(cfg, null, 2);

    try {
      await navigator.clipboard.writeText(pretty);
      alert("Config copied to clipboard — paste into testStackConfig.json.");
    } catch {
      prompt("Unable to write to clipboard. Copy the config below:", pretty);
    }
  };

  // Reset camera transform (center viewport and reset zoom)
  const handleReset = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setScale(1);
    setTranslateWorld({ x: centerX, y: centerY });
  };

  // Drag a single TechStack element (build mode only)
  const dragElement = (e: React.MouseEvent, id: string) => {
    if (!worldRef.current) return;

    const rect = worldRef.current.getBoundingClientRect();

    // Convert pointer position from viewport space -> world space
    const worldX = (e.clientX - rect.left - translateWorld.x) / scale;
    const worldY = (e.clientY - rect.top - translateWorld.y) / scale;

    // Maintain original cursor offset from element origin
    const newX = worldX - elementOffset.current.x;
    const newY = worldY - elementOffset.current.y;

    elementPositions[id] = { x: newX, y: newY };

    const el = document.querySelector(
      `[data-id="${id}"]`,
    ) as HTMLElement | null;

    // Direct DOM update avoids React rerenders during dragging
    if (el) el.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  //=======================
  // REFS =================
  //=======================

  // Ref to the "world" container (virtual PCB coordinates)
  const worldRef = useRef<HTMLDivElement>(null);
  // Ref to the viewport (visible area on screen)
  const viewportRef = useRef<HTMLDivElement>(null);
  // Ref to the logo inside the world (used for path alignment)
  const logoRef = useRef<HTMLDivElement>(null);

  //=======================
  // STATES & CONSTS ======
  //=======================

  // Translate + scale acts like a camera transforming world coords to viewport coords
  const [translateWorld, setTranslateWorld] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Track drag mode: either dragging the world or a single element
  const [dragMode, setDragMode] = useState<null | {
    type: "world" | "element";
    id?: string;
  }>(null);

  // Track whether paths have been calculated/rendered
  const [initLoaded, setInitLoaded] = useState(false);

  // Load translation limits and element positions from config
  const translateLimits = config.translateLimits;
  const elementPositions: Record<string, { x: number; y: number }> =
    config.elements;

  //=======================
  // MUTABLE REFS =========
  //=======================

  // Variables that change without causing re-renders
  const isDragging = useRef(false);
  // starting point of a drag
  const dragStart = useRef({ x: 0, y: 0 });
  // cursor-to-element offset during element drag
  const elementOffset = useRef({ x: 0, y: 0 });

  //=======================
  // INIT =================
  //=======================

  /*
    Rendering paths glitch explained:

    When the component initially renders, the custom font defined in SCSS
    might not have loaded yet. During this time, the browser falls back
    to a default system font (the “placeholder font”).

    Because the placeholder font has different character widths,
    text inside nodes and section names is slightly wider or narrower
    than it will be once the correct font loads.

    TechStackPaths are rendered only once after init is done,
    so the paths are calculated based on the initial widths of the text
    using the fallback font.

    When the custom font finishes loading, text widths update to their
    correct sizes, but the paths have already been drawn. This results
    in a small offset between the paths and their corresponding nodes.

    The visible effect is a few-pixel misalignment between nodes and paths,
    which only occurs on the first render before the font is fully loaded.

    Same thing is occuring with late images load, 
    thats why we check if all things that changes layout is loaded first
  */

  const imagesLoaded = useImagesLoaded(worldRef);
  const fontsLoaded = useFontsLoaded();

  useLayoutEffect(() => {
    if (!viewportRef.current || !worldRef.current || !config.elements) return;

    Object.keys(config.elements).forEach((id) => {
      const el = document.querySelector(
        `[data-id="${id}"]`,
      ) as HTMLElement | null;

      if (el) {
        const { x, y } = elementPositions[id];
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    });

    const rect = viewportRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTranslateWorld({ x: centerX, y: centerY });

    if (!buildMode && fontsLoaded && imagesLoaded) {
      setInitLoaded(true);
    }
  }, [buildMode, elementPositions, fontsLoaded, imagesLoaded]);

  //=======================
  // FULL SCREEN =========
  //=======================

  // Tracks whether PCB view is fullscreen
  const [fullScreen, setFullScreen] = useState(false);

  // Stores the world coordinates corresponding to the viewport center
  // Used to preserve the “camera” point when toggling fullscreen
  const pendingWorldPoint = useRef<{ worldX: number; worldY: number } | null>(
    null,
  );

  const toggleFullScreen = useCallback(() => {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();

    // Compute the point in world coordinates that matches the viewport center
    const worldX = (rect.width / 2 - translateWorld.x) / scale;
    const worldY = (rect.height / 2 - translateWorld.y) / scale;

    // Save it to adjust translation after the fullscreen state changes
    pendingWorldPoint.current = { worldX, worldY };

    // Toggle fullscreen and freeze background animations
    setFullScreen((prev) => !prev);
    setFreeze((prev) => !prev);
  }, [scale, setFreeze, translateWorld.x, translateWorld.y]);

  // Adjust translateWorld after fullscreen toggle to keep same world point at viewport center
  useLayoutEffect(() => {
    if (!pendingWorldPoint.current || !viewportRef.current) return;

    const { worldX, worldY } = pendingWorldPoint.current;
    const rect = viewportRef.current.getBoundingClientRect();

    // Compute new translation so the saved world point stays at center
    const newTranslate = {
      x: rect.width / 2 - worldX * scale,
      y: rect.height / 2 - worldY * scale,
    };

    setTranslateWorld(newTranslate);

    // Clear pending point after adjustment
    pendingWorldPoint.current = null;
  }, [fullScreen, scale]);

  // Detect ESC key to exit fullscreen
  useEffect(() => {
    if (!fullScreen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleFullScreen();
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [fullScreen, toggleFullScreen]);

  // Disable scrolling when fullscreen is active to prevent viewport jump
  useLayoutEffect(() => {
    const html = document.documentElement;

    if (fullScreen) {
      html.style.scrollBehavior = "auto";
      html.style.overflowY = "hidden";
    } else {
      html.style.overflowY = "visible";
      html.style.scrollBehavior = "";
    }

    return () => {
      html.style.overflowY = "visible";
      html.style.scrollBehavior = "";
    };
  }, [fullScreen]);

  //=======================
  // INTERACTIONS ========
  //=======================

  // Pinch / multi-touch refs

  // Tracks all active pointers (mouse/touch/finger)
  const activePointers = useRef<Map<number, PointerEvent>>(new Map());
  // Distance between two pointers at pinch start
  const pinchStartDistance = useRef<number | null>(null);
  // Scale of world at pinch start
  const pinchStartScale = useRef<number>(1);

  // Helper functions

  // Euclidean distance between two points
  const getDistance = (p1: PointerEvent, p2: PointerEvent) =>
    Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);

  // Midpoint between two pointers
  const getMidpoint = (p1: PointerEvent, p2: PointerEvent) => ({
    x: (p1.clientX + p2.clientX) / 2,
    y: (p1.clientY + p2.clientY) / 2,
  });

  // Recalculate translateWorld to keep a world point anchored at a screen position
  const calculateTranslate = ({
    worldX,
    worldY,
    scale,
    anchorX,
    anchorY,
  }: {
    viewportWidth: number;
    viewportHeight: number;
    worldX: number;
    worldY: number;
    scale: number;
    anchorX: number;
    anchorY: number;
  }) => ({
    x: anchorX - worldX * scale,
    y: anchorY - worldY * scale,
  });

  // Drag the world view by mouse/finger, respecting translateLimits and spacing
  const dragWorld = (clientX: number, clientY: number) => {
    if (!viewportRef.current) return;

    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;

    if (!buildMode && translateLimits) {
      const { minX, maxX, minY, maxY } = translateLimits;
      const vpWidth = viewportRef.current.clientWidth;
      const vpHeight = viewportRef.current.clientHeight;
      const spacing = {
        x: (vpWidth * spacingMult) / 100,
        y: (vpHeight * spacingMult) / 100,
      };

      // Clamp translation so world cannot move out of bounds
      const minTranslateX = vpWidth - (maxX * scale + spacing.x);
      const maxTranslateX = -minX * scale + spacing.x;
      const minTranslateY = vpHeight - (maxY * scale + spacing.y);
      const maxTranslateY = -minY * scale + spacing.y;

      newX = Math.min(Math.max(newX, minTranslateX), maxTranslateX);
      newY = Math.min(Math.max(newY, minTranslateY), maxTranslateY);
    }

    setTranslateWorld({ x: newX, y: newY });
  };

  // Wheel zoom
  // Zoom centered on mouse pointer
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const delta = -e.deltaY * zoomSpeed;

      // Clamp scale to allowed zoomRange
      const newScale = Math.min(
        Math.max(zoomRange.min, scale + delta),
        zoomRange.max,
      );

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - translateWorld.x) / scale;
      const worldY = (mouseY - translateWorld.y) / scale;

      // Adjust translation so zoom is anchored under pointer
      const newTranslate = calculateTranslate({
        viewportWidth: rect.width,
        viewportHeight: rect.height,
        worldX,
        worldY,
        scale: newScale,
        anchorX: mouseX,
        anchorY: mouseY,
      });

      setScale(newScale);
      setTranslateWorld(newTranslate);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [scale, translateWorld, zoomRange.min, zoomRange.max]);

  // pixels to distinguish click vs drag
  const DRAG_THRESHOLD = 5;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    activePointers.current.set(e.pointerId, e.nativeEvent);

    //PINCH START
    if (activePointers.current.size === 2) {
      isDragging.current = false;
      setDragMode(null);
      const [p1, p2] = Array.from(activePointers.current.values());
      pinchStartDistance.current = getDistance(p1, p2);
      pinchStartScale.current = scale;
      return;
    }

    //SINGLE POINTER
    if (activePointers.current.size === 1) {
      pointerStart.current = { x: e.clientX, y: e.clientY };
      isDragging.current = false;

      const el = (e.target as HTMLElement).closest("[data-draggable]");
      if (buildMode && el) {
        const id = el.getAttribute("data-id")!;
        setDragMode({ type: "element", id });

        const worldRect = worldRef.current!.getBoundingClientRect();
        const worldX = (e.clientX - worldRect.left - translateWorld.x) / scale;
        const worldY = (e.clientY - worldRect.top - translateWorld.y) / scale;
        const pos = elementPositions[id] ?? { x: 0, y: 0 };

        // store offset between pointer and element origin
        elementOffset.current = { x: worldX - pos.x, y: worldY - pos.y };
      } else {
        setDragMode({ type: "world" });
        dragStart.current = {
          x: e.clientX - translateWorld.x,
          y: e.clientY - translateWorld.y,
        };
      }

      if (e.pointerType !== "mouse")
        e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, e.nativeEvent);

    //PINCH ZOOM
    if (activePointers.current.size >= 2) {
      const [p1, p2] = Array.from(activePointers.current.values());
      if (!pinchStartDistance.current || !viewportRef.current) return;

      const rect = viewportRef.current.getBoundingClientRect();
      const midpoint = getMidpoint(p1, p2);
      const anchorX = midpoint.x - rect.left;
      const anchorY = midpoint.y - rect.top;

      const worldX = (anchorX - translateWorld.x) / scale;
      const worldY = (anchorY - translateWorld.y) / scale;

      const distanceRatio = getDistance(p1, p2) / pinchStartDistance.current;
      const scaleFactor = Math.pow(distanceRatio, 0.75); // pinch sensitivity
      const rawScale = pinchStartScale.current * scaleFactor;
      const newScale = Math.min(
        Math.max(zoomRange.min, rawScale),
        zoomRange.max,
      );

      const newTranslate = calculateTranslate({
        viewportWidth: rect.width,
        viewportHeight: rect.height,
        worldX,
        worldY,
        scale: newScale,
        anchorX,
        anchorY,
      });
      setScale(newScale);
      setTranslateWorld(newTranslate);
      return;
    }

    //SINGLE DRAG
    if (activePointers.current.size === 1 && pointerStart.current && dragMode) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;

      // Start dragging only if threshold exceeded
      if (!isDragging.current && Math.hypot(dx, dy) > DRAG_THRESHOLD)
        isDragging.current = true;
      if (!isDragging.current) return;

      if (dragMode.type === "world") dragWorld(e.clientX, e.clientY);
      if (dragMode.type === "element" && dragMode.id && buildMode)
        dragElement(e, dragMode.id);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);

    if (activePointers.current.size < 2) pinchStartDistance.current = null;
    if (activePointers.current.size === 0) {
      isDragging.current = false;
      setDragMode(null);
    }

    pointerStart.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return {
    //REFS
    worldRef,
    viewportRef,
    logoRef,

    //STATES
    translateWorld,
    scale,
    fullScreen,

    //INIT
    initLoaded,
    setInitLoaded,

    //HANDLERS
    toggleFullScreen,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,

    //BUILD MODE
    copyLayoutConfig,
    handleReset,
  };
}
