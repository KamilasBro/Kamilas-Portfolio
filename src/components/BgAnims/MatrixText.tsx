import "./bgAnims.scss";

import { MatrixColumnItem } from "./Interfaces/Interfaces";
import { MatrixTextProps } from "./Interfaces/Interfaces";

import { useEffect, useRef } from "react";
import useBgEngine from "./useBgEngine";

//React in this component mostly function as wrapper to match the portfolio structure
export default function MatrixText({
    //==========
    // CONFIG ==
    //==========

    baseInterval,

    baseFontSize,
    //font size multiplier
    fontSizeAmp = { min: 0.5, max: 1.25 },

    //speed range of columns fall
    speedRange,

    fillColor,

    //characters set
    charSet,

    //interval for changing character in column in ms
    mutateInterval = 100,
    //chance to mutate character in %
    mutateChancePercent = 50,

    //size modifiers
    sizeAmps = {
        length: {
            min: 1.85,
            max: 3.7
        },
        //the actual limit is based on screen width in code, this is just modifier
        maxColumns: 5.2
    },

    // Advanced performance tuning.
    // Controls adaptive frame skipping and spawn throttling.
    advancedConfig = {
        // Target ideal frame cost (ms).
        // Used as baseline for adaptive throttling.
        targetFrameBudget: 2,

        // Smoothing factor for exponential frame time averaging.
        avgFrameMsAlpha: 0.08,

        // Frame time thresholds triggering performance tiers.
        drawEveryNThresholds: [20, 30],

        // Corresponding frame skipping values per tier.
        drawEveryNValues: [1, 2, 3],

        // Corresponding spawn rate multipliers per tier.
        spawnMultiplierValues: [1, 1.5, 2]
    },

    // When true, simulation time stops advancing,
    // but RAF loop remains active.
    freeze,
}: MatrixTextProps): JSX.Element {
    //====================
    // SPECIFIC REFS =====
    //====================

    //active columns at frame
    const activeColumnsRef = useRef<MatrixColumnItem[]>([]);
    //recycled pool of columns
    const recycledColumnsRef = useRef<MatrixColumnItem[]>([]);

    // Compute real-time max number of columns based on screen width
    // Helps reduce column count on mobile for performance
    const maxCols = useRef<number>(0);

    //=============
    // ENGINE =====
    //=============

    const {
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
        spawnIfNeeded
    } = useBgEngine();

    useEffect(() => {
        const resize = () => {
            handleResize(canvasRef.current, sizeRef)
            //update actual max columns
            maxCols.current = Math.round(sizeRef.current.w) * sizeAmps.maxColumns / 100
        }
        //trigger once to apply changes at mount
        resize();

        window.visualViewport?.addEventListener("resize", resize);
        window.addEventListener("orientationchange", resize);
        return () => {
            window.visualViewport?.removeEventListener("resize", resize);
            window.removeEventListener("orientationchange", resize);
        };
        //we remount only if canvas change 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);

    //=============
    // HELPERS ====
    //=============

    const generateColumnData = (w: number, h: number) => {
        // x axis of column in current width range
        const x = getRndNmb(0, w);

        //actual font size
        const fontSize = Math.round(
            baseFontSize * getRndNmb(fontSizeAmp.min, fontSizeAmp.max)
        );

        //actual length
        const lengthAmp = getRndNmb(sizeAmps.length.min, sizeAmps.length.max) / 100;

        //characters count
        const charsCount = Math.round(h * lengthAmp);

        //actual column height
        const height = charsCount * fontSize;
        //actual falling speed
        const speed = getRndNmb(speedRange.min, speedRange.max);

        return {
            x,
            fontSize,
            charsCount,
            height,
            speed
        };
    }

    const spawnColumn = (
        simNow: number,
        activeColumns: MatrixColumnItem[],
        data: {
            x: number
            fontSize: number
            charsCount: number
            height: number
            speed: number
        }
    ) => {
        //get recycled columns
        const pool = recycledColumnsRef.current;
        let item: MatrixColumnItem;

        //destroy current pool column
        if (pool.length) {
            item = pool.pop()!;
        } else {
            item = {} as MatrixColumnItem;
            item.chars = [];
        }
        item.chars.length = 0;

        item.id = generateId();

        item.x = data.x;

        //starting point of spawned column, currently set at negative height
        //prevents from all columns spawning at the same y axis
        item.y = -data.height;

        item.speed = data.speed;
        item.fontSize = data.fontSize;
        item.chars.length = data.charsCount;

        for (let i = 0; i < data.charsCount; i++) {
            item.chars[i] = Math.floor(Math.random() * charSet.length);
        }
        item.height = data.height;

        item.nextMutateAt = simNow + Math.random() * mutateInterval;
        item.startAt = simNow + Math.random() * baseInterval;
        item.createdAt = simNow;

        // Add this new column to active paths
        // It will now be animated and rendered each frame
        activeColumns.push(item);
    }

    const drawColumn = (
        w: number,
        h: number,
        ctx: CanvasRenderingContext2D,
        simNow: number
    ) => {
        // reset canvas
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = fillColor;

        // Loop through all currently active columns
        for (const col of activeColumnsRef.current) {
            // Skip columns that haven't reached their start time yet
            if (simNow < col.startAt) continue;

            // Set the font for this column based on its assigned size
            ctx.font = `${col.fontSize}px monospace`;

            // Draw each character in the column
            for (let i = 0; i < col.chars.length; i++) {
                // Calculate y position of each character (columns fall downward)
                const y = col.y - i * col.fontSize;

                // Only render characters that are within the visible canvas area
                if (y > -col.fontSize && y < h)
                    ctx.fillText(charSet[col.chars[i]], col.x, y);
            }
        }
    }

    useEffect(() => {
        // check for canvas
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        // init styling
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.globalCompositeOperation = "source-over";


        // Function to update simulation and render frame
        const updateAndRender = (simNow: number, dt: number) => {
            // Check if current frame should be drawn based on adaptive rendering logic
            const { shouldDrawThisFrame } = adaptRendering(
                dt,
                advancedConfig,
                frameCountRef,
                avgFrameMsRef,
                drawEveryNRef,
                spawnMultiplierRef
            );
            if (!shouldDrawThisFrame) return; // Skip rendering if throttled

            //get current size of canvas
            const { w, h } = sizeRef.current;
            // Currently active columns
            const active = activeColumnsRef.current;

            // Compaction index for active columns
            let write = 0;

            // Update all active columns
            for (let i = 0; i < active.length; i++) {
                const col = active[i];

                // Skip columns not yet ready to start
                if (simNow < col.startAt) {
                    active[write++] = col;
                    continue;
                }

                // Move column downward based on speed and delta time
                col.y += col.speed * (dt / 1000);

                // Possibly mutate a character in this column
                if (simNow >= col.nextMutateAt) {
                    if (Math.random() * 100 < mutateChancePercent) {
                        const idx = Math.floor(Math.random() * col.chars.length);
                        col.chars[idx] = Math.floor(Math.random() * charSet.length);
                    }
                    // Schedule next mutation
                    col.nextMutateAt = simNow + mutateInterval;
                }

                // Recycle columns that have moved completely out of view
                if (col.y > h + col.height) {
                    if (recycledColumnsRef.current.length < maxCols.current)
                        recycledColumnsRef.current.push(col);
                    continue;
                }

                // Keep surviving columns at the front of the array
                active[write++] = col;
            }

            // Trim array to remove expired columns
            if (write < active.length) active.length = write;


            // check if column should be spawned.
            if (spawnIfNeeded(
                simNow,
                activeColumnsRef.current,
                advancedConfig.targetFrameBudget,
                baseInterval,
                maxCols.current
            )) {

                const columnData = generateColumnData(w, h);
                spawnColumn(simNow, active, columnData);

                // Update last added timestamp
                lastAddRef.current = simNow;
            }

            // Draw all active columns to canvas
            drawColumn(w, h, ctx, simNow);
        };

        // Main requestAnimationFrame loop
        const loop = (nowTimeStamp: number) => {
            if (lastRealTimeRef.current === null) lastRealTimeRef.current = nowTimeStamp;

            // Time elapsed since last frame
            const dt = nowTimeStamp - lastRealTimeRef.current;
            lastRealTimeRef.current = nowTimeStamp;

            // Advance simulation time unless frozen
            if (!freeze) simTimeRef.current += dt;

            // Update and render frame
            updateAndRender(simTimeRef.current, dt);

            // Schedule next frame
            rafRef.current = requestAnimationFrame(loop);
        }

        // Start the animation loop
        rafRef.current = requestAnimationFrame(loop);

        // Cleanup function to cancel RAF on unmount
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };

        // Only remount effect if canvasRef changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);

    return <canvas ref={canvasRef} className="matrix" />;
}
