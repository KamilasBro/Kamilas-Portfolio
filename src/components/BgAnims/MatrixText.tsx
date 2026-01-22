import React, { useEffect, useRef } from "react";
import "./bgAnims.scss";

interface ColumnItem {
    id: string;
    x: number;
    y: number;
    speed: number;
    fontSize: number;
    chars: string[];
    height: number;
    nextMutateAt: number;
    startAt: number;
    createdAt: number;
};

interface MatrixTextProps {
    baseInterval: number;
    baseFontSize: number;
    fontSizeAmp?: { min: number; max: number };
    speedRange: { min: number; max: number };
    mutateInterval?: number;
    mutateChancePercent?: number;
    fillColor: string;
    charSet: string[];
    sizeAmps?: {
        length: { min: number; max: number };
        maxColumns: number;
    };
    advancedConfig?: {
        targetFrameBudget: number;
        avgFrameMsAlpha: number;
        drawEveryNThresholds: number[];
        drawEveryNValues: number[];
        spawnMultiplierValues: number[];
    };
    freeze: boolean
};

function generateId() {
    return (
        (typeof crypto !== "undefined" && (crypto as any).randomUUID?.()) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
}

export default function MatrixText({
    baseInterval,
    baseFontSize,
    speedRange,
    fillColor,
    charSet,
    fontSizeAmp = { min: 0.5, max: 1.25 },
    mutateInterval = 100,
    mutateChancePercent = 50,
    sizeAmps = { length: { min: 1.85, max: 3.7 }, maxColumns: 5.2 },
    advancedConfig = {
        targetFrameBudget: 2,
        avgFrameMsAlpha: 0.08,
        drawEveryNThresholds: [20, 30],
        drawEveryNValues: [1, 2, 3],
        spawnMultiplierValues: [1, 1.5, 2]
    },
    freeze
}: MatrixTextProps): JSX.Element {

    // ----------------------
    // ARCHITECTURE REFS
    // ----------------------
    const simTimeRef = useRef(0);
    const lastRealTimeRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const activeRef = useRef<ColumnItem[]>([]);
    const poolRef = useRef<ColumnItem[]>([]);
    const lastAddRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const frameCountRef = useRef(2);
    const avgFrameMsRef = useRef(6);
    const spawnMultiplierRef = useRef(1);
    const drawEveryNRef = useRef(1);
    // ----------------------
    // HELPERS
    // ----------------------
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    function getMaxColumns(w: number) {
        return Math.round(w * sizeAmps.maxColumns / 100);
    }

    // ----------------------
    // RESIZE + DPR
    // ----------------------
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
        }

        resize();
        window.visualViewport?.addEventListener("resize", resize);
        window.addEventListener("orientationchange", resize);

        return () => {
            window.visualViewport?.removeEventListener("resize", resize);
            window.removeEventListener("orientationchange", resize);
        };
    }, []);

    // ----------------------
    // SPAWN LOGIC
    // ----------------------
    function spawnColumn(simNow: number) {
        const { w, h } = sizeRef.current;
        const x = rand(0, w);
        const fontSize = Math.round(baseFontSize * rand(fontSizeAmp.min, fontSizeAmp.max))
        const lengthAmp = rand(sizeAmps.length.min, sizeAmps.length.max) / 100;
        const charsCount = Math.round(h * lengthAmp);
        // const charsCount = rint(minChars, Math.min(maxChars, Math.floor(h / fontSize)));
        const chars = Array.from({ length: charsCount }, () =>
            charSet[Math.floor(Math.random() * charSet.length)]
        );
        const height = charsCount * fontSize;
        const speed = rand(speedRange.min, speedRange.max);

        const item: ColumnItem = poolRef.current.length
            ? (() => {
                const reused = poolRef.current.pop()!;
                reused.id = generateId();
                reused.x = x;
                reused.y = -height - Math.random() * Math.min(h, 200);
                reused.speed = speed;
                reused.fontSize = fontSize;
                reused.chars = chars;
                reused.height = height;
                reused.nextMutateAt = simNow + Math.random() * mutateInterval;
                reused.startAt = simNow + Math.random() * baseInterval;
                reused.createdAt = simNow;
                return reused;
            })()
            : {
                id: generateId(),
                x,
                y: -height - Math.random() * Math.min(h, 200),
                speed,
                fontSize,
                chars,
                height,
                nextMutateAt: simNow + Math.random() * mutateInterval,
                startAt: simNow + Math.random() * baseInterval,
                createdAt: simNow,
            };

        activeRef.current.push(item);
    }

    function spawnIfNeeded(simNow: number) {
        const active = activeRef.current;
        const multiplier = Math.max(
            1,
            Math.round(avgFrameMsRef.current / advancedConfig.targetFrameBudget)
        );
        const effectiveInterval = baseInterval * multiplier * spawnMultiplierRef.current;

        if (simNow - lastAddRef.current < effectiveInterval) return;
        const maxCols = getMaxColumns(sizeRef.current.w);

        if (active.length >= maxCols) {
            lastAddRef.current = simNow;
            return;
        }

        spawnColumn(simNow);
        lastAddRef.current = simNow;
    }

    // ----------------------
    // RAF LOOP
    // ----------------------
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.globalCompositeOperation = "source-over";

        function updateAndRender(simNow: number) {
            frameCountRef.current += 1;
            const lastFrameTime = (updateAndRender as any).lastTime ?? simNow;
            const dt = Math.max(0, simNow - lastFrameTime);
            (updateAndRender as any).lastTime = simNow;
            const dtSec = dt / 1000;

            // EMA frame ms
            avgFrameMsRef.current =
                avgFrameMsRef.current * (1 - advancedConfig.avgFrameMsAlpha) + dt * advancedConfig.avgFrameMsAlpha;

            // adapt drawing & spawn multiplier based on advanced config
            if (avgFrameMsRef.current > advancedConfig.drawEveryNThresholds[1]) {
                drawEveryNRef.current = advancedConfig.drawEveryNValues[2];
                spawnMultiplierRef.current = advancedConfig.spawnMultiplierValues[2];
            } else if (avgFrameMsRef.current > advancedConfig.drawEveryNThresholds[0]) {
                drawEveryNRef.current = advancedConfig.drawEveryNValues[1];
                spawnMultiplierRef.current = advancedConfig.spawnMultiplierValues[1];
            } else {
                drawEveryNRef.current = advancedConfig.drawEveryNValues[0];
                spawnMultiplierRef.current = advancedConfig.spawnMultiplierValues[0];
            }

            const drawThisFrame = frameCountRef.current % drawEveryNRef.current === 0;

            const { w, h } = sizeRef.current;
            const active = activeRef.current;
            let write = 0;

            for (let i = 0; i < active.length; i++) {
                const col = active[i];
                if (simNow < col.startAt) {
                    active[write++] = col;
                    continue;
                }

                col.y += col.speed * dtSec;

                if (simNow >= col.nextMutateAt) {
                    if (Math.random() * 100 < mutateChancePercent) {
                        const idx = Math.floor(Math.random() * col.chars.length);
                        col.chars[idx] = charSet[Math.floor(Math.random() * charSet.length)];
                    }
                    col.nextMutateAt = simNow + mutateInterval;
                }

                if (col.y > h + col.height) {
                    poolRef.current.push(col);
                    continue;
                }

                active[write++] = col;
            }

            if (write < active.length) active.length = write;

            spawnIfNeeded(simNow);

            if (drawThisFrame) {
                if (!ctx) return;
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = fillColor;
                for (const col of active) {
                    if (simNow < col.startAt) continue;
                    ctx.font = `${col.fontSize}px monospace`;
                    for (let i = 0; i < col.chars.length; i++) {
                        const y = col.y - i * col.fontSize;
                        if (y > -col.fontSize && y < h) ctx.fillText(col.chars[i], col.x, y);
                    }
                }
            }
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

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [freeze]);

    return <canvas ref={canvasRef} className="matrix" />;
}
