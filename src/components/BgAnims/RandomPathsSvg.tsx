import React, { useState, useEffect, useRef } from 'react';
import "./bgAnims.scss";

type PathItem = { id: string; d: string };

export default function RandomPaths() {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [svgPaths, setSvgPaths] = useState<PathItem[]>([]);

  const lastAddTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const intervalFrequency = 250;     // ms
  const animationDuration = 5000;    // ms
  const maxPaths = 0;
  const pathOptions = {
    minLenght: 100,
    maxLenght: 400,
    fragments: 8,
  };
  useEffect(() => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    function generatePath(): PathItem {

      const rand = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min) + min);

      let currentAxis: 'x' | 'y' = Math.random() < 0.5 ? 'x' : 'y';
      let last = {
        x: rand(0, containerBox.width),
        y: rand(0, containerBox.height),
      };

      const direction = {
        axis: currentAxis,
        add:
          currentAxis === 'x'
            ? last.x <= containerBox.width * (2 / 3)
            : last.y <= containerBox.height * (2 / 3),
      };

      const cords = [`M${last.x} ${last.y}`];

      for (let i = 0; i < pathOptions.fragments; i++) {
        const len = rand(pathOptions.minLenght, pathOptions.maxLenght);

        if (currentAxis === 'x') {
          last.x +=
            direction.axis === 'x'
              ? direction.add ? len : -len
              : Math.random() < 0.5 ? len : -len;
        } else {
          last.y +=
            direction.axis === 'y'
              ? direction.add ? len : -len
              : Math.random() < 0.5 ? len : -len;
        }

        cords.push(`L${last.x} ${last.y}`);
        currentAxis = currentAxis === 'x' ? 'y' : 'x';
      }

      return {
        id:
          crypto.randomUUID?.() ??
          Math.random().toString(36).slice(2) + Date.now().toString(36),
        d: cords.toString(),
      };
    }

    function loop(now: number) {
      if (now - lastAddTimeRef.current >= intervalFrequency) {
        setSvgPaths(prev => {
          if (prev.length >= maxPaths) return prev;
          return [...prev, generatePath()];
        });
        lastAddTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg ref={containerRef} className="random-paths">
      {svgPaths.map(path => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="magenta"
          strokeWidth="2"
          strokeLinecap="round"
          ref={el => {
            if (!el) return;

            const length = el.getTotalLength();
            el.style.strokeDasharray = `${length}`;
            el.style.strokeDashoffset = `${length}`;
            el.style.setProperty('--length', `${length}px`);
            el.style.animation = `drawAndErase ${animationDuration}ms forwards`;

            el.onanimationend = () => {
              setSvgPaths(prev => prev.filter(p => p.id !== path.id));
            };
          }}
        />
      ))}
    </svg>
  );
}
