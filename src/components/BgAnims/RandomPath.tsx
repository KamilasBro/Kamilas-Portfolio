import React, { useEffect, useRef } from "react";
import "./bgAnims.scss";

// Typy pomocnicze
interface Point { x: number; y: number };
interface PathItem {
    id: string;
    points: Point[];
    segLens: number[];
    segPrefix: number[];
    totalLen: number;
    createdAt: number;
    drawDuration: number;
    eraseDuration: number;
    lineWidth: number;
    strokeStyle: string;
}
interface AdvancedConfig {
    targetFrameBudget?: number;
    avgFrameMsAlpha?: number;
    drawEveryNThresholds?: number[];
    drawEveryNValues?: number[];
    spawnMultiplierValues?: number[];
}
interface RandomPathsProps {
    baseInterval: number;
    animationDuration: number;
    pathFragments: number;
    maxActive?: number;
    lenghtsAmp?: { min: number; max: number };
    strokeColor: string;
    strokeWidth: number;
    advancedConfig?: AdvancedConfig;
    freeze: boolean;
}

function generateId() {
    return (
        (typeof crypto !== "undefined" && (crypto as any).randomUUID?.()) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
}

export default function RandomPaths({
    baseInterval,
    animationDuration,
    pathFragments,
    maxActive,
    lenghtsAmp = { min: 0.04, max: 0.16 },
    strokeColor,
    strokeWidth,
    advancedConfig,
    freeze
}: RandomPathsProps): JSX.Element {

    const cfg = {
        targetFrameBudget: 2,
        avgFrameMsAlpha: 0.08,
        drawEveryNThresholds: [20, 30],
        drawEveryNValues: [1, 2, 3],
        spawnMultiplierValues: [1, 1.5, 2],
        ...advancedConfig
    };

    const maxActiveValue = maxActive ?? animationDuration / baseInterval;

    const simTimeRef = useRef(0);
    const lastRealTimeRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const activeRef = useRef<PathItem[]>([]);
    const poolRef = useRef<PathItem[]>([]);
    const lastAddRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const frameCountRef = useRef(2);
    const avgFrameMsRef = useRef(6);
    const spawnMultiplierRef = useRef(1);
    const drawEveryNRef = useRef(5);

    const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

    function computeLensAndPrefix(points: Point[]) {
        const segLens: number[] = [];
        const segPrefix: number[] = [0];
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const l = dist(points[i], points[i + 1]);
            segLens.push(l);
            total += l;
            segPrefix.push(total);
        }
        return { segLens, segPrefix, totalLen: total };
    }

    function generatePathPoints(containerW: number, containerH: number): Point[] {
        const rand = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min) + min);

        let currentAxis: "x" | "y" = Math.random() < 0.5 ? "x" : "y";
        let last = { x: rand(0, containerW), y: rand(0, containerH) };
        const direction = {
            axis: currentAxis,
            add: currentAxis === "x" ? last.x <= containerW * (2 / 3) : last.y <= containerH * (2 / 3)
        };
        const points: Point[] = [{ ...last }];

        for (let i = 0; i < pathFragments; i++) {
            const len = {
                x: (Math.random() * (lenghtsAmp.max - lenghtsAmp.min) + lenghtsAmp.min) * containerW,
                y: (Math.random() * (lenghtsAmp.max - lenghtsAmp.min) + lenghtsAmp.min) * containerH
            };
            if (currentAxis === "x") {
                last.x += direction.axis === "x" ? (direction.add ? len.x : -len.x) : (Math.random() < 0.5 ? len.x : -len.x);
            } else {
                last.y += direction.axis === "y" ? (direction.add ? len.y : -len.y) : (Math.random() < 0.5 ? len.y : -len.y);
            }
            points.push({ ...last });
            currentAxis = currentAxis === "x" ? "y" : "x";
        }
        return points;
    }

    function drawPartial(
        ctx: CanvasRenderingContext2D,
        points: Point[],
        segLens: number[],
        segPrefix: number[],
        totalLen: number,
        startLen: number,
        endLen: number
    ) {
        if (endLen <= 0 || startLen >= totalLen) return;
        startLen = Math.max(0, startLen);
        endLen = Math.min(endLen, totalLen);

        let lo = 0, hi = segPrefix.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (segPrefix[mid] <= startLen) lo = mid + 1; else hi = mid;
        }
        let si = Math.max(0, lo - 1);

        lo = 0; hi = segPrefix.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (segPrefix[mid] < endLen) lo = mid + 1; else hi = mid;
        }
        let ei = Math.max(0, lo - 1);

        let started = false;
        for (let i = si; i <= ei; i++) {
            const segStart = segPrefix[i];
            const segLen = segLens[i];
            const localStart = Math.max(0, (startLen - segStart) / segLen);
            const localEnd = Math.min(1, (endLen - segStart) / segLen);

            const p0 = points[i];
            const p1 = points[i + 1];
            const sx = p0.x + (p1.x - p0.x) * localStart;
            const sy = p0.y + (p1.y - p0.y) * localStart;
            const ex = p0.x + (p1.x - p0.x) * localEnd;
            const ey = p0.y + (p1.y - p0.y) * localEnd;

            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
            ctx.lineTo(ex, ey);
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        function resize() {
            if (!canvas || !ctx) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.floor(window.visualViewport?.width ?? window.innerWidth);
            const h = Math.floor(window.visualViewport?.height ?? window.innerHeight);
            sizeRef.current = { w, h };
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }

        resize();
        window.visualViewport?.addEventListener("resize", resize);
        window.addEventListener("orientationchange", resize);
        return () => {
            window.visualViewport?.removeEventListener("resize", resize);
            window.removeEventListener("orientationchange", resize);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.lineJoin = "bevel";
        ctx.lineCap = "round";

        function spawnIfNeeded(simNow: number) {
            const active = activeRef.current;
            const multiplier = Math.max(1, Math.round(avgFrameMsRef.current / cfg.targetFrameBudget!));
            const effectiveInterval = baseInterval * multiplier * spawnMultiplierRef.current;
            if (simNow - lastAddRef.current < effectiveInterval) return;
            if (active.length >= maxActiveValue) { lastAddRef.current = simNow; return; }

            const { w, h } = sizeRef.current;
            const points = generatePathPoints(w, h);
            const { segLens, segPrefix, totalLen } = computeLensAndPrefix(points);
            if (totalLen <= 0.5) { lastAddRef.current = simNow; return; }

            const pool = poolRef.current;
            let item: PathItem;
            if (pool.length) {
                item = pool.pop()!;
                item.id = generateId();
                item.points = points;
                item.segLens = segLens;
                item.segPrefix = segPrefix;
                item.totalLen = totalLen;
                item.createdAt = simNow;
                item.drawDuration = animationDuration / 2;
                item.eraseDuration = animationDuration / 2;
                item.lineWidth = strokeWidth;
                item.strokeStyle = strokeColor;
            } else {
                item = {
                    id: generateId(),
                    points,
                    segLens,
                    segPrefix,
                    totalLen,
                    createdAt: simNow,
                    drawDuration: animationDuration / 2,
                    eraseDuration: animationDuration / 2,
                    lineWidth: strokeWidth,
                    strokeStyle: strokeColor
                };
            }
            active.push(item);
            lastAddRef.current = simNow;
        }

        function updateAndRender(simNow: number) {
            frameCountRef.current += 1;
            const lastFrameTime = (updateAndRender as any).lastTime ?? simNow;
            const dt = Math.max(0, simNow - lastFrameTime);
            (updateAndRender as any).lastTime = simNow;

            avgFrameMsRef.current = avgFrameMsRef.current * (1 - cfg.avgFrameMsAlpha!) + dt * cfg.avgFrameMsAlpha!;

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

            const drawThisFrame = (frameCountRef.current % drawEveryNRef.current) === 0;
            const act = activeRef.current;
            let write = 0;

            if (drawThisFrame) {
                if (!ctx) return;
                const { w, h } = sizeRef.current;
                ctx.clearRect(0, 0, w, h);
                ctx.globalCompositeOperation = "source-over";
                ctx.lineWidth = strokeWidth;
                ctx.strokeStyle = strokeColor;
            }

            for (let i = 0; i < act.length; i++) {
                const p = act[i];
                const life = simNow - p.createdAt;
                let startLen = 0, endLen = 0;

                if (life < p.drawDuration) { endLen = p.totalLen * (life / p.drawDuration); }
                else if (life < p.drawDuration + p.eraseDuration) {
                    startLen = p.totalLen * ((life - p.drawDuration) / p.eraseDuration);
                    endLen = p.totalLen;
                } else { poolRef.current.push(p); continue; }

                if (drawThisFrame) {
                    if (!ctx) return;
                    ctx.beginPath();
                    drawPartial(ctx, p.points, p.segLens, p.segPrefix, p.totalLen, startLen, endLen);
                    ctx.stroke();
                }
                act[write++] = p;
            }

            if (write < act.length) act.length = write;
            spawnIfNeeded(simNow);
        }

        function loop(now: number) {
            if (lastRealTimeRef.current === null) lastRealTimeRef.current = now;
            const realDt = now - lastRealTimeRef.current;
            lastRealTimeRef.current = now;
            if (!freeze) simTimeRef.current += realDt;
            updateAndRender(simTimeRef.current);
            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
    }, [freeze, baseInterval, animationDuration, pathFragments, strokeWidth, strokeColor, lenghtsAmp, maxActive, advancedConfig]);

    return <canvas ref={canvasRef} className="random-paths" />;
}
