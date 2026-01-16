import React, { useState, useEffect, useRef } from 'react'
import { ReactComponent as LogoSvg } from "../../images/logo/logoGradient.svg";
export default function LoadingScreen(
    {
        isLoading,
        setisLoading,
    }: {
        isLoading: boolean;
        setisLoading: React.Dispatch<React.SetStateAction<boolean>>;
    }
) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const logoRef = useRef<HTMLDivElement | null>(null);
    const topChipRef = useRef<HTMLDivElement | null>(null);
    const bottomChipRef = useRef<HTMLDivElement | null>(null);
    const ballRef = useRef<SVGCircleElement>(null);

    const [paths, setPaths] = useState<string[]>([]);
    const [borderPath, setBorderPath] = useState("");
    const [logoActive, setLogoActive] = useState(false);
    const [canLeaveLoadingScreen, setCanLeaveLoadingScreen] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const gap = 8;
    const computePaths = () => {
        if (!logoRef.current ||
            !topChipRef.current ||
            !bottomChipRef.current ||
            !ballRef.current) return;

        const logoBox = logoRef.current.getBoundingClientRect();
        const topChipBox = topChipRef.current.getBoundingClientRect();
        const bottomChipBox = bottomChipRef.current.getBoundingClientRect();


        setBorderPath(`
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${logoBox.left + logoBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${logoBox.left + logoBox.width / 2} ${logoBox.bottom}
                L ${logoBox.left + gap} ${logoBox.bottom}
                L ${logoBox.left} ${logoBox.bottom - gap}
                L ${logoBox.left} ${logoBox.top + gap}
                L ${logoBox.left + gap} ${logoBox.top}
                L ${logoBox.left + logoBox.width / 2} ${logoBox.top}
                L ${logoBox.left + logoBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}

                M ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
                L ${logoBox.left + logoBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
                L ${logoBox.left + logoBox.width / 2} ${logoBox.top}
                L ${logoBox.right - gap} ${logoBox.top}
                L ${logoBox.right} ${logoBox.top + gap}
                L ${logoBox.right} ${logoBox.bottom - gap}
                L ${logoBox.right - gap} ${logoBox.bottom}
                L ${logoBox.left + logoBox.width / 2} ${logoBox.bottom}
                L ${logoBox.left + logoBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
            `)
        setPaths([
            `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2 - gap}
                L ${logoBox.left + logoBox.width / 2 - gap} ${bottomChipBox.top + bottomChipBox.height / 2 - gap}
                L ${logoBox.left + logoBox.width / 2 - gap} ${logoBox.bottom + gap}
                L ${logoBox.left + (gap / 2)} ${logoBox.bottom + gap}
                L ${logoBox.left - gap} ${logoBox.bottom - (gap / 2)}
                L ${logoBox.left - gap} ${logoBox.top + logoBox.width / 2 + (gap / 2)}
                L ${logoBox.left - (gap + (gap / 4))} ${logoBox.top + logoBox.width / 2 - (gap / 2)}
                L ${logoBox.left - (gap + (gap / 4))} ${logoBox.top + gap - (gap / 2)}
                L ${logoBox.left + (gap / 2)} ${logoBox.top - (gap + (gap / 2)) + (gap / 4)}
                L ${logoBox.left + logoBox.width / 2 - gap} ${logoBox.top - (gap + (gap / 2)) + (gap / 4)}
                L ${logoBox.left + logoBox.width / 2 - gap} ${topChipBox.top + topChipBox.height / 2 - gap}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2 - gap}
            `,
            `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2 - (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 - (gap / 2)} ${bottomChipBox.top + bottomChipBox.height / 2 - (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 - (gap / 2)} ${logoBox.bottom + (gap / 2)}
                L ${logoBox.left + gap - (gap / 4)} ${logoBox.bottom + (gap / 2)}
                L ${logoBox.left - (gap / 2)} ${logoBox.bottom - gap + (gap / 4)}
                L ${logoBox.left - (gap / 2)} ${logoBox.top + logoBox.width / 2 + (gap / 2)}
                L ${logoBox.left - gap + (gap / 4)} ${logoBox.top + logoBox.width / 2 - (gap / 2)}
                L ${logoBox.left - gap + (gap / 4)} ${logoBox.top + gap - (gap / 4)}
                L ${logoBox.left + gap - (gap / 4)} ${logoBox.top - gap + (gap / 4)}
                L ${logoBox.left + logoBox.width / 2 - (gap / 2)} ${logoBox.top - gap + (gap / 4)}
                L ${logoBox.left + logoBox.width / 2 - (gap / 2)} ${topChipBox.top + topChipBox.height / 2 - (gap / 2)}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2 - (gap / 2)}
            `,
            `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2 + (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 + (gap / 2)} ${bottomChipBox.top + bottomChipBox.height / 2 + (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 + (gap / 2)} ${logoBox.bottom + (gap - (gap / 4))}
                L ${logoBox.right - gap + (gap / 4)} ${logoBox.bottom + (gap - (gap / 4))}
                L ${logoBox.right + gap - (gap / 4)} ${logoBox.bottom - gap + (gap / 4)}
                L ${logoBox.right + gap - (gap / 4)} ${logoBox.top + logoBox.width / 2 - (gap / 2) + (gap / 4)}
                L ${logoBox.right + (gap / 2)} ${logoBox.top + logoBox.width / 2 - gap - (gap / 4)}
                L ${logoBox.right + (gap / 2)} ${logoBox.top + gap - (gap / 4)}
                L ${logoBox.right - (gap - (gap / 4))} ${logoBox.top - gap + (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 + (gap / 2)} ${logoBox.top - gap + (gap / 2)}
                L ${logoBox.left + logoBox.width / 2 + (gap / 2)} ${topChipBox.top + bottomChipBox.width / 2 + (gap / 2)}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2 + (gap / 2)}
            `,
            `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2 + gap}
                L ${logoBox.left + logoBox.width / 2 + gap} ${bottomChipBox.top + bottomChipBox.height / 2 + gap}
                L ${logoBox.left + logoBox.width / 2 + gap} ${logoBox.bottom + (gap + (gap / 4))}
                L ${logoBox.right - (gap / 2)} ${logoBox.bottom + (gap + (gap / 4))}
                L ${logoBox.right + gap + (gap / 4)} ${logoBox.bottom - (gap / 2)}
                L ${logoBox.right + gap + (gap / 4)} ${logoBox.top + logoBox.width / 2 - (gap / 2) + (gap / 4)}
                L ${logoBox.right + gap} ${logoBox.top + logoBox.width / 2 - gap - (gap / 4)}
                L ${logoBox.right + gap} ${logoBox.top + gap - (gap / 2)}
                L ${logoBox.right - (gap / 2)} ${logoBox.top - gap}
                L ${logoBox.left + logoBox.width / 2 + gap} ${logoBox.top - gap}
                L ${logoBox.left + logoBox.width / 2 + gap} ${topChipBox.top + bottomChipBox.width / 2 + gap}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2 + gap}

            `,
        ])
    }

    useEffect(() => {
        if (pageLoaded && canLeaveLoadingScreen) {
            setisLoading(false);
        }
    }, [pageLoaded, canLeaveLoadingScreen, setisLoading]);

    useEffect(() => {
        function onLoaded() {
            requestAnimationFrame(() => {
                setPageLoaded(true);
            });
        }

        if (document.readyState === "complete") {
            onLoaded();
        } else {
            window.addEventListener("load", onLoaded);
        }

        return () => window.removeEventListener("load", onLoaded);
    }, []);

    useEffect(() => {
        const body = document.body;
        const scrollY = window.scrollY;

        if (isLoading) {
            body.style.overflow = "hidden";
            body.style.position = "fixed";
            body.style.top = `-${scrollY}px`;
            body.style.width = "100%";
        }

        return () => {
            body.style.overflow = "";
            body.style.position = "";
            body.style.top = "";
            body.style.width = "";

            window.scrollTo(0, scrollY);
        };
    }, [isLoading]);

    useEffect(() => {
        if (!logoRef.current || !containerRef.current) return;

        const ro = new ResizeObserver(() => {
            computePaths();
        });

        ro.observe(containerRef.current);

        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!ballRef.current || !logoRef.current) return;
        const logoBox = logoRef.current.getBoundingClientRect();

        const ball = ballRef.current;

        // wszystkie normalne ścieżki
        const svgPaths = Array.from(document.querySelectorAll<SVGPathElement>('.loading-paths path'));
        // border path (zakładam, że masz tylko jedną)
        const borderPaths = Array.from(document.querySelectorAll<SVGPathElement>('.border-paths path'));

        if (!svgPaths.length) return;

        // obliczamy indeks środka tablicy
        const middleIndex = Math.floor(svgPaths.length / 2);

        // wplatanie borderPath w środek
        const allPaths: SVGPathElement[] = [
            ...svgPaths.slice(0, middleIndex),
            ...(borderPaths.length ? [borderPaths[0]] : []),
            ...svgPaths.slice(middleIndex)
        ];

        let index = 0;
        let reverse = false;
        let start: number | null = null;
        let hasCompletedOnePath = false;
        const speed = 0.55; // px/ms - prędkość piłki

        function step(time: number) {
            if (!start) start = time;
            const path = allPaths[index];
            const length = path.getTotalLength();

            // progress w 0..1 w zależności od długości ścieżki i prędkości
            let progress = (speed * (time - start)) / length;
            const t = reverse ? 1 - progress : progress;

            const point = path.getPointAtLength(Math.min(t, 1) * length);
            if (logoBox) {
                const isInsideLogoY =
                    point.y >= logoBox.top - gap * 2 &&
                    point.y <= logoBox.bottom + gap * 2;

                setLogoActive(prev => {
                    if (prev !== isInsideLogoY) {
                        return isInsideLogoY;
                    }
                    return prev;
                });
            }
            ball.setAttribute("cx", `${point.x}`);
            ball.setAttribute("cy", `${point.y}`);

            if (progress >= 1) {
                index = (index + 1) % allPaths.length;
                start = time;

                if (!hasCompletedOnePath) {
                    hasCompletedOnePath = true;
                    setCanLeaveLoadingScreen(true);
                }

                if (index !== middleIndex) reverse = !reverse;
            }

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }, [paths]);


    return (
        <div className="loading-screen" ref={containerRef}>
            <div className='chips-wrap'>
                <div className='chip' ref={topChipRef} />
                <div className='loading-logo' ref={logoRef}>
                    <LogoSvg className={`${logoActive && "active"}`} />
                </div>
                <div className='chip' ref={bottomChipRef} />
            </div>
            <svg className="border-paths" xmlns="http://www.w3.org/2000/svg">
                <path
                    d={borderPath}
                />
            </svg>
            <svg className="loading-paths" xmlns="http://www.w3.org/2000/svg">
                {paths.map((d, i) => (
                    <path
                        className={`path${i + 1}`}
                        key={i}
                        d={d}
                    />
                ))}
            </svg>
            <svg className="ball" xmlns="http://www.w3.org/2000/svg">
                <circle ref={ballRef} cx={0} cy={0} />
            </svg>
        </div>
    )
}
