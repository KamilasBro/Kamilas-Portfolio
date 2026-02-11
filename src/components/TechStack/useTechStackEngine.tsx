import React, { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction, useLayoutEffect } from 'react';

import config from "../../data/techStack/config.json";

interface TechStackProps {
    zoomRange?: {
        min: number;
        max: number;
    };
    spacingMult?: number;
    buildMode?: boolean;
    setFreeze?: Dispatch<SetStateAction<boolean>>;
}

interface ConfigInterface {
    elements?: Record<string, {
        x: number;
        y: number;
    }>,
    translateLimits?: Partial<{
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }>
}

export default function useTechStackEngine({
    zoomRange = { min: 0.5, max: 2.5 },
    spacingMult = 50,
    buildMode = false,
    setFreeze = (prev) => !prev
}: TechStackProps) {

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
                    minX: Math.min(acc.minX, pos.x),
                    minY: Math.min(acc.minY, pos.y),
                    maxX: Math.max(acc.maxX, pos.x + width),
                    maxY: Math.max(acc.maxY, pos.y + height),
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

    //Paths component needs to wait until all INIT is done
    const [renderPaths, setRenderPaths] = useState(false);

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
    useEffect(() => {
        if (!viewportRef.current) return;

        // If config is empty object or has no meaningful keys -> do nothing (use defaults)
        if (!config.elements) {
            // nothing to apply
            return;
        }

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
        !buildMode && setRenderPaths(true);
    }, []);

    //to adjust number of columns in grid based of elements inside stack array
    const getColumns = (count: number): number => {
        if (count < 2) return count;

        const sqrt = Math.sqrt(count);
        for (let cols = Math.ceil(sqrt); cols <= count; cols++) {
            return cols;
        }
        // fallback, jeśli pętla nie zwróci
        return Math.ceil(sqrt);
    };
    
    /*we manipulate order of original array to create snake layout
    (currently manipulating only order of paths so stack render is intact)
    for stack in left side of world we alternate only even rows
    1 2 3   =>  3 2 1
    4 5 6       4 5 6
    7 8 9   =>  9 8 7
    for stack in right side of world we alternate only odd rows
    1 2 3       1 2 3
    4 5 6   =>  6 5 4
    7 8 9       7 8 9

    however elements render is using only pathDirection purerly in class for scss styling
    */
    const snakeGrid = <T,>(target: T[], i: number, alternateEvenOdd?: boolean) => {
        const columns = getColumns(target.length);
        const row = Math.floor(i / columns);
        const indexInRow = i % columns;

        const displayIndex =
            ((row % 2 === 0) !== alternateEvenOdd)
                ? row * columns + (columns - indexInRow - 1)
                : i;

        return {
            displayIndex,
            node: target[displayIndex],
            pathDirection: row % 2 === 0 ? "bottom" : "top",
            row,
        };
    };


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
    useEffect(() => {
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
    //Interactions ==========
    //=======================

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
    }) => {
        return {
            x: anchorX - worldX * scale,
            y: anchorY - worldY * scale,
        };
    };
    const dragWorld = (e: React.MouseEvent) => {
        if (!viewportRef.current) return;

        let newX = e.clientX - dragStart.current.x;
        let newY = e.clientY - dragStart.current.y;

        // jeśli mamy translateLimits, ograniczamy ruch
        if (!buildMode && translateLimits) {
            const limitKeys: (keyof NonNullable<ConfigInterface["translateLimits"]>)[] = [
                "minX", "maxX", "minY", "maxY"
            ];
            if (limitKeys.every(k => k in translateLimits)) {
                const { minX, maxX, minY, maxY } = translateLimits as Record<typeof limitKeys[number], number>;
                const vpWidth = viewportRef.current.clientWidth;
                const vpHeight = viewportRef.current.clientHeight;

                const calculatedSpacing = {
                    x: vpWidth * spacingMult / 100,
                    y: vpHeight * spacingMult / 100
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

    //wheel event listener
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const zoomSpeed = 0.001;
            const delta = -e.deltaY * zoomSpeed;
            const newScale = Math.min(Math.max(zoomRange.min, scale + delta), zoomRange.max);

            if (!worldRef.current) return;

            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // world coords of mouse before zoom
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!buildMode) {
            setDragMode({ type: "world" });
            isDragging.current = true;
            dragStart.current = {
                x: e.clientX - translateWorld.x,
                y: e.clientY - translateWorld.y,
            };
            return;
        }

        const el = (e.target as HTMLElement).closest("[data-draggable]");
        if (el) {
            const id = el.getAttribute("data-id")!;
            setDragMode({ type: "element", id });

            const worldRect = worldRef.current!.getBoundingClientRect();

            // mouse position in world-space
            const worldX = (e.clientX - worldRect.left - translateWorld.x) / scale;
            const worldY = (e.clientY - worldRect.top - translateWorld.y) / scale;

            const pos = elementPositions[id] ?? { x: 0, y: 0 };

            elementOffset.current = {
                x: worldX - pos.x,
                y: worldY - pos.y,
            };

            isDragging.current = true;
            return;
        }

        // fallback -> world drag
        setDragMode({ type: "world" });
        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - translateWorld.x,
            y: e.clientY - translateWorld.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !dragMode) return

        if (dragMode.type === "world") dragWorld(e);
        if (dragMode.type === "element" && dragMode.id) dragElement(e, dragMode.id);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        setDragMode(null);
    };
    return {
        // ===== refs =====
        worldRef,
        viewportRef,
        logoRef,

        // ===== state =====
        translateWorld,
        scale,
        fullScreen,
        renderPaths,
        setRenderPaths,

        // ===== config / data =====
        elementPositions,
        translateLimits,

        // ===== init =====
        getColumns,
        snakeGrid,

        // ===== actions / handlers =====
        handleCopyConfig,
        handleReset,
        toggleFullScreen,

        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
}
