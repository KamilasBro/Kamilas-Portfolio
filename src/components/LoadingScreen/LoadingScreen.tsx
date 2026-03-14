import "./loadingScreen.scss"
import { ReactComponent as LogoSvg } from "../../images/logo/logoGradient.svg";

import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function LoadingScreen(
    {
        isLoading,
        setisLoading,
        gap,
        ballTravelSpeed = 0.5
    }: {
        isLoading: boolean;
        setisLoading: React.Dispatch<React.SetStateAction<boolean>>;
        gap: number;
        ballTravelSpeed?: number;
    }
) {
    // force the speed to stay in the allowed range
    if (ballTravelSpeed < 0.1) ballTravelSpeed = 0.1;
    if (ballTravelSpeed > 1.5) ballTravelSpeed = 1.5;

    //elements refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const logoRef = useRef<HTMLDivElement | null>(null);
    const topChipRef = useRef<HTMLDivElement | null>(null);
    const bottomChipRef = useRef<HTMLDivElement | null>(null);
    //paths refs
    const borderPathRef = useRef<SVGSVGElement>(null);
    const pathsRef = useRef<SVGSVGElement>(null);
    const ballRef = useRef<SVGCircleElement>(null);

    //Storing paths coords in states
    const [borderPath, setBorderPath] = useState("");
    //here are multiple paths so its array
    const [paths, setPaths] = useState<string[]>([]);

    //if ball is at border path logo is styled
    const [logoActive, setLogoActive] = useState(false);

    //Boths states below are considered as gatekeepers from ending laoding screen

    //this state is working as minimal animation duration, 
    //after ball travels to the next chip for the first time we set it to true
    //that way laoding screen wont end in fraction of second
    const [canLeaveLoadingScreen, setCanLeaveLoadingScreen] = useState(false);

    //to make sure content of page is ready
    const [pageLoaded, setPageLoaded] = useState(false);

    //Paths are generated semi manually to keep shape but adjust based on gap and logo size
    const generateBorderPaths = useCallback((logoBox: DOMRect, topChipBox: DOMRect, bottomChipBox: DOMRect) => {
        return (
            `
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
            `
        )
    }, [gap])
    const generatePaths = useCallback((logoBox: DOMRect, topChipBox: DOMRect, bottomChipBox: DOMRect) => {
        return (
            [
                `      
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}          
                L ${bottomChipBox.right} ${bottomChipBox.top + bottomChipBox.height / 2 - gap}
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
                L ${topChipBox.left} ${topChipBox.top + topChipBox.height / 2 - gap}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
            `,
                `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${bottomChipBox.right} ${bottomChipBox.top + bottomChipBox.height / 2 - (gap / 2)}
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
                L ${topChipBox.left} ${topChipBox.top + topChipBox.height / 2 - (gap / 2)}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
            `,
                `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${bottomChipBox.right} ${bottomChipBox.top + bottomChipBox.height / 2 + (gap / 2)}
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
                L ${topChipBox.left} ${topChipBox.top + topChipBox.height / 2 + (gap / 2)}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
            `,
                `                
                M ${bottomChipBox.right - topChipBox.width / 2} ${bottomChipBox.top + bottomChipBox.height / 2}
                L ${bottomChipBox.right} ${bottomChipBox.top + bottomChipBox.height / 2 + gap}
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
                L ${topChipBox.left} ${topChipBox.top + topChipBox.height / 2 + gap}
                L ${topChipBox.left + topChipBox.width / 2} ${topChipBox.top + topChipBox.height / 2}
            `,
            ]
        )
    }, [gap])

    /*
    We generate paths based on logo size and gap
    Resize Observer ensures paths are recalculated whenever the logo or container 
    changes size
    */
    useEffect(() => {
        if (!logoRef.current || !containerRef.current) return;

        const ro = new ResizeObserver(() => {
            if (!logoRef.current || !topChipRef.current || !bottomChipRef.current) return;

            const logoBox = logoRef.current.getBoundingClientRect();
            const topChipBox = topChipRef.current.getBoundingClientRect();
            const bottomChipBox = bottomChipRef.current.getBoundingClientRect();

            setBorderPath(generateBorderPaths(logoBox, topChipBox, bottomChipBox))
            setPaths(generatePaths(logoBox, topChipBox, bottomChipBox))
        });

        ro.observe(containerRef.current);

        return () => ro.disconnect();
    }, [generateBorderPaths, generatePaths]);

    //we check if page is loaded
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

    //we disable scroll during loading screen and on ending we scroll to top of page
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

    //we are animating ball so it will move on paths
    //its a loop until conditions to end will be fulfilled
    useEffect(() => {
        if (!ballRef.current || !logoRef.current) return;
        const logoBox = logoRef.current.getBoundingClientRect();
        const ball = ballRef.current;

        //getting paths from refs
        const svgPaths = pathsRef.current
            ? Array.from(pathsRef.current.querySelectorAll<SVGPathElement>('path'))
            : [];

        const borderPaths = borderPathRef.current
            ? Array.from(borderPathRef.current.querySelectorAll<SVGPathElement>('path'))
            : [];

        if (!svgPaths.length) return;
        //in this layout border path is considered as middle path for ball to travel

        //first we calculate middle index
        const middleIndex = Math.floor(svgPaths.length / 2);
        //then creating array that stores all paths together 
        //and put border path to correct position
        const allPaths: SVGPathElement[] = [
            ...svgPaths.slice(0, middleIndex),
            ...(borderPaths.length ? [borderPaths[0]] : []),
            ...svgPaths.slice(middleIndex)
        ];

        //ball will alternate pathing every arrival on chip
        //starting from bottom chip ball goes on 1st path to top chip
        //then returns using 2nd path, goes on 3rd returns on 4th and so on
        //the only exception is when current path is border path 
        //in this case ball will return using different edge of border


        let currentPath = 0;
        //to alternate ball travel
        let reverse = false;
        //animation start timestamp
        let start: number | null = null;

        //flag to allow leaving loading screen after first path
        let hasCompletedOnePath = false;

        let rafId: number;

        //animation step function
        function step(time: number) {
            if (!start) start = time;
            const path = allPaths[currentPath];
            const length = path.getTotalLength();

            //compute progress along the path (0..1)
            let progress = (ballTravelSpeed * (time - start)) / length;
            //reverse if needed, middleindex is always not reversed
            const t =
                currentPath === middleIndex
                    ? progress
                    : reverse ? 1 - progress : progress;

            //get current point on path
            const point = path.getPointAtLength(Math.min(t, 1) * length);

            //update logo activation
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

            //move the ball to the current point
            ball.setAttribute("cx", `${point.x}`);
            ball.setAttribute("cy", `${point.y}`);

            //if path is completed
            if (progress >= 1) {
                //move to next path
                currentPath = (currentPath + 1) % allPaths.length;
                //reset timestamp
                start = time;

                //mark first path completion so loading screen can be disabled
                if (!hasCompletedOnePath) {
                    hasCompletedOnePath = true;
                    setCanLeaveLoadingScreen(true);
                }
                //alternate direction except when on the middle (border) path
                if (currentPath !== middleIndex) reverse = !reverse;
            }
            //request next animation frame
            rafId = requestAnimationFrame(step);
        }
        //start animation
        rafId = requestAnimationFrame(step);

        //cleanup 
        return () => cancelAnimationFrame(rafId);
    }, [paths, gap, ballTravelSpeed]);

    // we check every dependency change if laoding screen should end
    useEffect(() => {
        if (pageLoaded && canLeaveLoadingScreen) {
            setisLoading(false);
        }
    }, [pageLoaded, canLeaveLoadingScreen, setisLoading]);

    return (
        <div className="loading-screen" ref={containerRef}>
            <div className='chips-wrap'>
                <div className='chip' ref={topChipRef} />
                <div className='loading-logo' ref={logoRef}>
                    <LogoSvg className={`${logoActive ? "active" : ""}`} />
                </div>
                <div className='chip' ref={bottomChipRef} />
            </div>
            <svg className="border-paths" ref={borderPathRef} xmlns="http://www.w3.org/2000/svg">
                <path
                    d={borderPath}
                />
            </svg>
            <svg className="loading-paths" ref={pathsRef} xmlns="http://www.w3.org/2000/svg">
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
