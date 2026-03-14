import "./bgAnims.scss";

import { RandomPathsProps } from "./Interfaces/Interfaces";
import { RandomPathsPoint } from "./Interfaces/Interfaces";
import { RandomPathsItem } from "./Interfaces/Interfaces";

import { useEffect, useRef } from "react";
import useBgEngine from "./useBgEngine";

//React in this component mostly function as wrapper to match the portfolio structure
export default function RandomPaths({
    //==========
    // CONFIG ==
    //==========

    baseInterval,

    // Full lifecycle duration of a path.
    // Internally split into draw phase + erase phase.
    animationDuration,

    // Number of directional turns per generated path.
    // Higher value → more complex zigzag geometry.
    pathSegments,

    // Hard cap on simultaneously active paths.
    // Real maximum is also limited by duration / interval.
    maxActive,

    // Relative length range for each segment (percentage of canvas size).
    // Acts as geometric scaling control.
    lengthsAmp = { min: 0.04, max: 0.16 },

    // Canvas stroke styling.
    strokeColor,
    strokeWidth,

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
}: RandomPathsProps): JSX.Element {

    //the true max active is determined by duration divided by interval
    //maxActive is used as hard limit, however if limit is higher than duration/interval
    //limit will never be reached
    const maxActiveValue = maxActive ?? animationDuration / baseInterval;

    //====================
    // SPECIFIC REFS =====
    //====================

    //active paths at frame
    const activePathsRef = useRef<RandomPathsItem[]>([]);
    //recycled pool of paths
    const recycledPathsRef = useRef<RandomPathsItem[]>([]);


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


    //===========
    // HELPERS ==
    //===========

    //generates a single path as a series of points within the container dimensions.
    //the path “zigzags” by alternating between x and y axes, but the main axis
    //(chosen randomly at start) moves consistently in one direction
    const generatePathPoints = () => {
        //getting canvas size
        const { w, h } = sizeRef.current;

        //randomly select the main axis for the path
        let currentAxis: "x" | "y" = Math.random() < 0.5 ? "x" : "y";

        //pick a random starting point within the container
        let last = { x: getRndNmb(0, w), y: getRndNmb(0, h) };

        //determine the direction along the main axis:

        //If the starting point is in the first 2/3 of the main axis,
        //move forward (right for x, down for y).
        //If in the last third, move backward (left for x, up for y).
        //that most of time prevents path from going its lifetime outside the screen

        const direction = {
            axis: currentAxis,
            add: currentAxis === "x" ? last.x <= w * (2 / 3) : last.y <= h * (2 / 3)
        };

        // Initialize the points array with the starting point
        const points: RandomPathsPoint[] = [{ ...last }];

        //pathSegments is fixed number provided as config
        //for each fragment we set starting and ending point
        for (let i = 0; i < pathSegments; i++) {

            // Generate random lengths for the next segment along x and y
            const len = {
                x: getRndNmb(lengthsAmp.min, lengthsAmp.max,) * w,
                y: getRndNmb(lengthsAmp.min, lengthsAmp.max,) * h,
            };

            // Move the point along the current axis
            if (currentAxis === "x") {
                // Main axis: move consistently according to 'direction.add'
                // Secondary axis: move randomly left or right
                last.x += direction.axis === "x" ? (direction.add ? len.x : -len.x) : (Math.random() < 0.5 ? len.x : -len.x);
            } else {
                last.y += direction.axis === "y" ? (direction.add ? len.y : -len.y) : (Math.random() < 0.5 ? len.y : -len.y);
            }

            // Push a copy of the new point into the array
            points.push({ ...last });

            // Alternate axis for next segment to create a zigzag path
            currentAxis = currentAxis === "x" ? "y" : "x";
        }

        return points;
    }

    //Compute points generated into lengths of each segment
    const computePathSegments = (points: RandomPathsPoint[]) => {
        //lenghts of segments ex. [5,10,30]
        const segmentsLength: number[] = [];
        //cumulative lenghts ex. [0,5,15,45]
        const segmentsPrefix: number[] = [0];

        //sum of all path segments
        let totalPathLength = 0;

        //calculate distance between function
        const distance = (a: RandomPathsPoint, b: RandomPathsPoint) =>
            Math.hypot(b.x - a.x, b.y - a.y);

        for (let i = 0; i < points.length - 1; i++) {
            const currentLenght = distance(points[i], points[i + 1]);

            segmentsLength.push(currentLenght);
            totalPathLength += currentLenght;
            segmentsPrefix.push(totalPathLength);
        }

        return { segmentsLength, segmentsPrefix, totalPathLength };
    }

    //creates path item abd reusable paths
    const spawnPath = (
        simNow: number,
        points: RandomPathsPoint[],
        //length of each path segment
        segmentsLength: number[],
        //cumulative path lengths
        segmentsPrefix: number[],
        //total path length
        totalPathLength: number,
        activePaths: RandomPathsItem[]
    ) => {
        if (!totalPathLength) return;
        // poolRef holds old path objects that finished animation.
        // Reusing them avoids unnecessary memory allocations.
        const pool = recycledPathsRef.current;

        let item: RandomPathsItem;

        // If we have a reusable object, recycle it
        if (pool.length) {
            item = pool.pop()!;
        } else {
            item = {} as RandomPathsItem;
            item.points = [];
        }
        item.points.length = 0;

        //add rest of data
        item.id = generateId();

        // path coordinates
        item.points = points;

        // individual segment lengths
        item.segmentsLength = segmentsLength;
        // cumulative lengths
        item.segmentsPrefix = segmentsPrefix;
        // full path length
        item.totalPathLength = totalPathLength;

        // time where animation started
        item.createdAt = simNow;

        //animation duration (halved because duration value is considered as whole)
        item.drawDuration = animationDuration / 2;
        item.eraseDuration = animationDuration / 2;
        //style properties
        item.lineWidth = strokeWidth;
        item.strokeStyle = strokeColor;

        // Add this new path to active paths
        // It will now be animated and rendered each frame
        activePaths.push(item);
    }

    //draw path
    const drawPathSegments = (
        ctx: CanvasRenderingContext2D,
        points: RandomPathsPoint[],

        segmentsLength: number[],
        segmentsPrefix: number[],
        totalPathLength: number,

        startingLength: number,
        endingLength: number
    ) => {
        //If the requested range is completely outside the path, do nothing
        if (endingLength <= 0 || startingLength >= totalPathLength) return;

        //Make sure startingLength is not below 0
        startingLength = Math.max(0, startingLength);
        //Make sure endingLength is not bigger than full path length
        endingLength = Math.min(endingLength, totalPathLength);

        //We will now find which segment contains startingLength

        //Start searching from beginning of prefix array
        let lowestInRange = 0;

        //End searching at last prefix index
        let highestInRange = segmentsPrefix.length - 1;

        //Binary search to find first prefix bigger than startingLength
        while (lowestInRange < highestInRange) {

            //Middle index between lowest and highest
            const middleInRange = (lowestInRange + highestInRange) >> 1;

            //If current prefix is still before or equal to startingLength
            //move search window to the right
            if (segmentsPrefix[middleInRange] <= startingLength)
                lowestInRange = middleInRange + 1;
            else
                //Otherwise move search window to the left
                highestInRange = middleInRange;
        }

        //Segment index where drawing should start
        let startingIndex = Math.max(0, lowestInRange - 1);

        //Now do the same but for endingLength

        lowestInRange = 0;
        highestInRange = segmentsPrefix.length - 1;

        //Binary search to find segment where drawing should end
        while (lowestInRange < highestInRange) {

            const middleInRange = (lowestInRange + highestInRange) >> 1;

            //If prefix is still smaller than endingLength
            //go right
            if (segmentsPrefix[middleInRange] < endingLength)
                lowestInRange = middleInRange + 1;
            else
                //Otherwise go left
                highestInRange = middleInRange;
        }

        //Segment index where drawing should end
        let endingIndex = Math.max(0, lowestInRange - 1);

        //This tells us if we already started drawing the path
        //We need moveTo only once at the beginning
        let startDraw = false;


        for (let i = startingIndex; i <= endingIndex; i++) {
            //Convert global path length into local segment percentage (0 to 1)
            //This tells us where inside THIS segment we should start and end drawing
            const pathStart = Math.max(0, (startingLength - segmentsPrefix[i]) / segmentsLength[i]);
            const pathEnd = Math.min(1, (endingLength - segmentsPrefix[i]) / segmentsLength[i]);

            //currentPoint
            const cp = points[i];
            //nextPoint
            const np = points[i + 1];

            //start x axis
            const sx = cp.x + (np.x - cp.x) * pathStart;
            //start y axis
            const sy = cp.y + (np.y - cp.y) * pathStart;
            //end x axis
            const ex = cp.x + (np.x - cp.x) * pathEnd;
            //end y axis
            const ey = cp.y + (np.y - cp.y) * pathEnd;

            if (!startDraw) {
                ctx.moveTo(sx, sy);
                startDraw = true;
            }
            else
                ctx.lineTo(sx, sy);

            ctx.lineTo(ex, ey);
        }
    }

    //=================
    // CANVAS RESIZE ==
    //=================
    useEffect(() => {
        const resize = () => handleResize(canvasRef.current, sizeRef)
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
    // LIFECYCLE ==
    //=============
    useEffect(() => {
        // Core render function driven by simulation time (not frame count).
        // This makes animation deterministic and independent of actual FPS.

        //check if canvas is ready
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        
        const updateAndRender = (simNow: number, dt: number) => {
            // check if path should be drawn and adapt rendering step.
            const { shouldDrawThisFrame } = adaptRendering(
                dt,
                advancedConfig,
                frameCountRef,
                avgFrameMsRef,
                drawEveryNRef,
                spawnMultiplierRef
            );
            if (!shouldDrawThisFrame) return;

            //get current size of canvas
            const { w, h } = sizeRef.current;
            // get currently animated path objects (mutable ref, not React state).
            let activePaths = activePathsRef.current;

            // reset canvas
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeColor;

            // check if path should be spawned.
            if (spawnIfNeeded(
                simNow,
                activePathsRef.current,
                advancedConfig.targetFrameBudget,
                baseInterval,
                maxActiveValue
            )) {
                //generate path points
                const points = generatePathPoints();
                //check path segments lengths
                const {
                    segmentsLength,
                    segmentsPrefix,
                    totalPathLength
                } = computePathSegments(points);

                // Reuse finished path objects to reduce allocations and GC pressure.
                spawnPath(
                    simNow,
                    points,
                    segmentsLength,
                    segmentsPrefix,
                    totalPathLength,
                    activePaths
                );

                // Update last added timestamp
                lastAddRef.current = simNow;
            }

            // In-place compaction index.
            // Used to remove expired paths without allocating a new array.
            let write = 0;

            for (let i = 0; i < activePaths.length; i++) {
                const cp = activePaths[i];

                // Path age in simulation time.
                const lifecycle = simNow - cp.createdAt;

                let start = 0, end = 0;

                // Phase 1: Drawing
                // Reveal path progressively from 0 → total length.
                if (lifecycle < cp.drawDuration) {
                    end = cp.totalPathLength * (lifecycle / cp.drawDuration);
                }
                // Phase 2: Erasing
                // Head stays at full length, tail advances forward.
                else if (
                    lifecycle < cp.drawDuration + cp.eraseDuration
                ) {
                    start = cp.totalPathLength * ((lifecycle - cp.drawDuration) / cp.eraseDuration);
                    end = cp.totalPathLength;
                }
                // Phase 3: Completed
                // Move object to reusable pool and skip rendering.
                else {
                    if (recycledPathsRef.current.length < maxActiveValue)
                        recycledPathsRef.current.push(cp);
                    continue;
                }

                // draw path
                ctx.beginPath();
                drawPathSegments(
                    ctx,
                    cp.points,
                    cp.segmentsLength,
                    cp.segmentsPrefix,
                    cp.totalPathLength,
                    start,
                    end
                );
                ctx.stroke();

                // Keep surviving paths compacted at the front of array.
                activePaths[write++] = cp;
            }

            // Truncate array to remove expired items in O(1).
            if (write < activePaths.length)
                activePaths.length = write;
        };

        // Main animation loop.
        // requestAnimationFrame provides high-resolution timestamp.
        const loop = (now: number) => {
            // Initialize reference timestamp on first frame.
            if (lastRealTimeRef.current === null)
                lastRealTimeRef.current = now;

            // const lastFrameTime = (adaptRendering as any).lastTime ?? simNow;
            // const dt = Math.max(0, simNow - lastFrameTime);
            // (adaptRendering as any).lastTime = simNow;

            // Real delta time between frames.
            const dt = now - lastRealTimeRef.current;
            lastRealTimeRef.current = now;

            // Separate simulation time from real time.
            // Allows clean pause (freeze) without stopping RAF loop.
            if (!freeze)
                simTimeRef.current += dt;

            // Render based strictly on simulation clock.
            updateAndRender(simTimeRef.current, dt);

            // Schedule next frame.
            rafRef.current = requestAnimationFrame(loop);
        };

        // Start animation loop on
        rafRef.current = requestAnimationFrame(loop);

        // Cleanup on unmount or dependency update.
        // Prevents orphaned RAF loops.
        return () => {
            if (rafRef.current)
                cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
        //we remount only if canvas change 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);

    return <canvas ref={canvasRef} className="random-paths" />;
}
