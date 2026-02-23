import React, { useRef, useState, useEffect, Dispatch, SetStateAction, useLayoutEffect } from 'react';

import { TechStackEnginePropsInterface } from './Interfaces/Interfaces';
import { ConfigInterface } from './Interfaces/Interfaces';

import config from "../../data/techStack/config.json";

//=======================
//About Engine ==========
//=======================

//this file is just for storing massive ammount of functions 
//outside of render component to make it "cleaner"
//all stuff here is used in TechStack component



export default function useTechStackEngine({
    zoomRange = { min: 0.5, max: 2.5 },
    spacingMult = 50,
    buildMode,
    setFreeze
}: TechStackEnginePropsInterface) {

    //=======================
    //Build Mode (Dev Only) =
    //=======================

    /*
    The BuildMode is simple solution to effectively help me position techstack elements
    without code tons of algorythms, that won't check every edge case anyway or
    code values directly inside component.
    It turned out to be really helpful tool, more than I need tbh.
    */

    //buildmode is passed as prop


    //we generate config, copy it and paste inside config.json 
    //in data folder, overwriting it completely
    const handleCopyConfig = async () => {
        const { minX, minY, maxX, maxY } = Object.entries(elementPositions).reduce(
            (acc, [id, pos]) => {
                const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
                if (!el) return acc;

                const width = el.clientWidth / scale;
                const height = el.clientHeight / scale;

                return {
                    minX: Math.min(acc.minX, Math.trunc(pos.x)),
                    minY: Math.min(acc.minY, Math.trunc(pos.y)),
                    maxX: Math.max(acc.maxX, Math.trunc(pos.x + width)),
                    maxY: Math.max(acc.maxY, Math.trunc(pos.y + height))
                };
            },
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
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
    const handleReset = () => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const rect = viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setScale(1);
        setTranslateWorld({ x: centerX, y: centerY });
    }

    const dragElement = (e: React.MouseEvent, id: string) => {
        if (!worldRef.current) return;

        const rect = worldRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - translateWorld.x) / scale;
        const worldY = (e.clientY - rect.top - translateWorld.y) / scale;

        const newX = worldX - elementOffset.current.x;
        const newY = worldY - elementOffset.current.y;

        elementPositions[id] = { x: newX, y: newY };

        const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
        if (el) el.style.transform = `translate(${newX}px, ${newY}px)`;
    };


    //=======================
    //REFS ==================
    //=======================
    const worldRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);


    //=======================
    //STATES & CONSTS =======
    //=======================
    const [translateWorld, setTranslateWorld] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [dragMode, setDragMode] = useState<null | {
        type: "world" | "element";
        id?: string;
    }>(null);


    //Paths states
    const [initLoaded, setInitLoaded] = useState(false);

    //Both are loading from config file
    //limits of transforming world
    const translateLimits = config.translateLimits;
    //elements positions in world
    const elementPositions: Record<string, { x: number; y: number }> = config.elements;


    //=======================
    //MUTABLE REFS ==========
    //=======================

    /* We have some variables that don't want to cause rerenders 
    and are changing in certain scenarios */
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    // offset between cursor position in world and element origin at drag start
    const elementOffset = useRef({ x: 0, y: 0 });

    //=======================
    //INIT ==================
    //=======================
    useLayoutEffect(() => {
        if (!viewportRef.current || !worldRef.current || !config.elements) return;

        Object.keys(config.elements).forEach(id => {
            const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
            if (el) {
                const { x, y } = elementPositions[id];
                el.style.transform = `translate(${x}px, ${y}px)`;
            }
        });

        //center world
        const rect = viewportRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setTranslateWorld({ x: centerX, y: centerY });

        //make sure that paths component is ready 
        //in buildmode the paths are rendered on toggling button
        !buildMode && setInitLoaded(true);
    }, []);

    //=======================
    //FULL SCREEN ===========
    //=======================
    const [fullScreen, setFullScreen] = useState(false);

    const pendingWorldPoint = useRef<{ worldX: number; worldY: number; } | null>(null);

    const toggleFullScreen = () => {
        if (!viewportRef.current) return;

        const rect = viewportRef.current.getBoundingClientRect();

        // Punkt w świecie odpowiadający środkowi viewportu
        const worldX = (rect.width / 2 - translateWorld.x) / scale;
        const worldY = (rect.height / 2 - translateWorld.y) / scale;

        pendingWorldPoint.current = {
            worldX,
            worldY,
        };

        // Toggle fullscreen
        setFullScreen(prev => !prev);
        setFreeze(prev => !prev);
    };

    useLayoutEffect(() => {
        if (!pendingWorldPoint.current || !viewportRef.current) return;

        const { worldX, worldY } = pendingWorldPoint.current;
        const rect = viewportRef.current.getBoundingClientRect();

        // Obliczamy translateWorld tak, żeby punkt świata pozostał w tym samym miejscu
        const newTranslate = {
            x: rect.width / 2 - worldX * scale,
            y: rect.height / 2 - worldY * scale
        };

        setTranslateWorld(newTranslate);

        pendingWorldPoint.current = null;
    }, [fullScreen, scale]);

    //detect quitting fullscreen on esc press
    useEffect(() => {
        if (!fullScreen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                toggleFullScreen()
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [fullScreen, toggleFullScreen]);

    //disable scroll visibility on fullscreen
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
    // Interactions =========
    //=======================

    // ----- Pinch refs -----
    const activePointers = useRef<Map<number, PointerEvent>>(new Map());
    const pinchStartDistance = useRef<number | null>(null);
    const pinchStartScale = useRef<number>(1);

    // ----- Helpers -----
    const getDistance = (p1: PointerEvent, p2: PointerEvent) =>
        Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);

    const getMidpoint = (p1: PointerEvent, p2: PointerEvent) => ({
        x: (p1.clientX + p2.clientX) / 2,
        y: (p1.clientY + p2.clientY) / 2,
    });

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

    const dragWorld = (clientX: number, clientY: number) => {
        if (!viewportRef.current) return;

        let newX = clientX - dragStart.current.x;
        let newY = clientY - dragStart.current.y;

        if (!buildMode && translateLimits) {
            const limitKeys: (keyof NonNullable<ConfigInterface["translateLimits"]>)[] =
                ["minX", "maxX", "minY", "maxY"];

            if (limitKeys.every(k => k in translateLimits)) {
                const { minX, maxX, minY, maxY } =
                    translateLimits as Record<typeof limitKeys[number], number>;

                const vpWidth = viewportRef.current.clientWidth;
                const vpHeight = viewportRef.current.clientHeight;

                const calculatedSpacing = {
                    x: vpWidth * spacingMult / 100,
                    y: vpHeight * spacingMult / 100,
                };

                const minTranslateX = vpWidth - (maxX * scale + calculatedSpacing.x);
                const maxTranslateX = -minX * scale + calculatedSpacing.x;
                const minTranslateY = vpHeight - (maxY * scale + calculatedSpacing.y);
                const maxTranslateY = -minY * scale + calculatedSpacing.y;

                newX = Math.min(Math.max(newX, minTranslateX), maxTranslateX);
                newY = Math.min(Math.max(newY, minTranslateY), maxTranslateY);
            }
        }

        setTranslateWorld({ x: newX, y: newY });
    };

    // Wheel Zoom
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const zoomSpeed = 0.001;
            const delta = -e.deltaY * zoomSpeed;

            const newScale = Math.min(
                Math.max(zoomRange.min, scale + delta),
                zoomRange.max
            );

            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const worldX = (mouseX - translateWorld.x) / scale;
            const worldY = (mouseY - translateWorld.y) / scale;

            const newTranslate = calculateTranslate({
                viewportWidth: rect.width,
                viewportHeight: rect.height,
                worldX,
                worldY,
                scale: newScale,
                anchorX: mouseX,
                anchorY: mouseY
            });

            setScale(newScale);
            setTranslateWorld(newTranslate);
        };

        viewport.addEventListener("wheel", handleWheel, { passive: false });
        return () => viewport.removeEventListener("wheel", handleWheel);
    }, [scale, translateWorld, zoomRange.max, zoomRange.min]);

    // ----- Drag threshold -----
    const DRAG_THRESHOLD = 5; // pixels
    const pointerStart = useRef<{ x: number; y: number } | null>(null);

    // Pointer Down
    const handlePointerDown = (e: React.PointerEvent) => {
        activePointers.current.set(e.pointerId, e.nativeEvent);

        // ----- PINCH START -----
        if (activePointers.current.size === 2) {
            isDragging.current = false;
            setDragMode(null);

            const [p1, p2] = Array.from(activePointers.current.values());
            pinchStartDistance.current = getDistance(p1, p2);
            pinchStartScale.current = scale;
            return;
        }

        // ----- SINGLE POINTER -----
        if (activePointers.current.size === 1) {
            pointerStart.current = { x: e.clientX, y: e.clientY };
            isDragging.current = false; // drag will start after threshold

            const el = (e.target as HTMLElement).closest("[data-draggable]");

            if (buildMode && el) {
                const id = el.getAttribute("data-id")!;
                setDragMode({ type: "element", id });

                const worldRect = worldRef.current!.getBoundingClientRect();
                const worldX = (e.clientX - worldRect.left - translateWorld.x) / scale;
                const worldY = (e.clientY - worldRect.top - translateWorld.y) / scale;
                const pos = elementPositions[id] ?? { x: 0, y: 0 };

                elementOffset.current = { x: worldX - pos.x, y: worldY - pos.y };
            } else {
                setDragMode({ type: "world" });
                dragStart.current = { x: e.clientX - translateWorld.x, y: e.clientY - translateWorld.y };
            }

            if (e.pointerType !== "mouse") e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    // Pointer Move
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activePointers.current.has(e.pointerId)) return;
        activePointers.current.set(e.pointerId, e.nativeEvent);

        // ----- PINCH -----
        if (activePointers.current.size >= 2) {
            const [p1, p2] = Array.from(activePointers.current.values());
            if (!pinchStartDistance.current || !viewportRef.current) return;

            const rect = viewportRef.current.getBoundingClientRect();
            const midpoint = getMidpoint(p1, p2);

            const anchorX = midpoint.x - rect.left;
            const anchorY = midpoint.y - rect.top;

            const worldX = (anchorX - translateWorld.x) / scale;
            const worldY = (anchorY - translateWorld.y) / scale;

            const newDistance = getDistance(p1, p2);
            const distanceRatio = newDistance / pinchStartDistance.current;

            const pinchSensitivity = 0.75;
            const scaleFactor = Math.pow(distanceRatio, pinchSensitivity);

            const rawScale = pinchStartScale.current * scaleFactor;
            const newScale = Math.min(Math.max(zoomRange.min, rawScale), zoomRange.max);

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

        // ----- SINGLE DRAG -----
        if (activePointers.current.size === 1 && pointerStart.current && dragMode) {
            const dx = e.clientX - pointerStart.current.x;
            const dy = e.clientY - pointerStart.current.y;

            if (!isDragging.current) {
                if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
                    isDragging.current = true;
                } else {
                    return; // small movement -> treat as click
                }
            }

            if (dragMode.type === "world") {
                dragWorld(e.clientX, e.clientY);
            }

            if (dragMode.type === "element" && dragMode.id && buildMode) {
                dragElement(e, dragMode.id);
            }
        }
    };

    // Pointer Up / Cancel
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
        handleCopyConfig,
        handleReset,
    };
}
