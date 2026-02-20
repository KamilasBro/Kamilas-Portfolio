import React, { useEffect, useRef, useLayoutEffect, useState } from "react"

import { TechStackPathsPropsInterface } from "./Interfaces/Interfaces";

export default function TechStackPaths({
    worldRef,
    logoRef,
    gridGap = 60,
    pathGap = 8,
    snakeGrid,
    ballSpeed = 800,
    ballState,
    setBallState,
    techStack
}: TechStackPathsPropsInterface) {
    const gap = pathGap;
    const ballRef = useRef<SVGCircleElement>(null);

    const calcGap = (length: number, i: number) => {
        return gap * i - gap * (length - 1) / 2;
    }

    const [sectionPaths, setSectionPaths] = useState<Record<string, string>>({});
    const [nodesPaths, setNodesPaths] = useState<Record<string, string>>({});
    const [subNodesPaths, setSubNodesPaths] = useState<Record<string, string>>({});

    const getCoordsAndSize = (target: DOMRect, worldRect: DOMRect) => {
        return {
            width: target.width,
            height: target.height,
            left: target.left - worldRect.left,
            right: target.right - worldRect.left,
            top: target.top - worldRect.top - worldRect.height / 2,
            bottom: target.bottom - worldRect.top - worldRect.height / 2,

            center: {
                x: target.left - worldRect.left + target.width / 2,
                y: target.top - worldRect.top - worldRect.height / 2 + target.height / 2,
            },
            leftCenter: {
                x: target.left - worldRect.left,
                y: target.top - worldRect.top - worldRect.height / 2 + target.height / 2
            },
            rightCenter: {
                x: target.right - worldRect.left,
                y: target.top - worldRect.top - worldRect.height / 2 + target.height / 2
            },
            topCenter: {
                x: target.left - worldRect.left + target.width / 2,
                y: target.top - worldRect.top - worldRect.height / 2
            },
            bottomCenter: {
                x: target.left - worldRect.left + target.width / 2,
                y: target.bottom - worldRect.top - worldRect.height / 2
            }
        }
    }

    useLayoutEffect(() => {
        const map: Record<string, string> = {}
        const logoEl = logoRef.current;
        const worldEl = worldRef.current;
        if (!logoEl || !worldEl) return;

        const worldRect = worldEl.getBoundingClientRect();
        const logo = getCoordsAndSize(logoEl.getBoundingClientRect(), worldRect);

        techStack.forEach((stackSection, i) => {
            const targetEl = worldEl.querySelector(`[data-id="${stackSection.sectionName}"]`) as HTMLElement | null;
            if (!targetEl) return;
            const target = getCoordsAndSize(targetEl.getBoundingClientRect(), worldRect);

            map[stackSection.sectionName] = (() => {
                const logoStart = target.center.x <= 0
                    ? { x: logo.leftCenter.x, y: logo.leftCenter.y + calcGap(techStack.length, i) }
                    : { x: logo.rightCenter.x, y: logo.rightCenter.y + calcGap(techStack.length, i) }

                const targetEnd = target.center.y <= 0
                    ? { x: target.bottomCenter.x, y: target.bottomCenter.y }
                    : { x: target.topCenter.x, y: target.topCenter.y }
                return `
                        M ${logoStart.x} ${logoStart.y}
                        L ${targetEnd.x} ${logoStart.y}
                        L ${targetEnd.x} ${targetEnd.y}
                        `;
            })();
        });

        setSectionPaths(map);
    }, [])
    useLayoutEffect(() => {
        const map: Record<string, string> = {}
        const worldEl = worldRef.current;

        if (!worldEl) return;

        const worldRect = worldEl.getBoundingClientRect();

        techStack.forEach((stackSection) => {
            const targetSectionEl = worldEl.querySelector(`[data-id="${stackSection.sectionName}"]`) as HTMLElement | null;
            const targetNodesWrapEl = worldEl.querySelector(`[data-id="nodes-${stackSection.sectionName}"]`) as HTMLElement | null;

            if (!targetSectionEl || !targetNodesWrapEl) return;

            const targetSection = getCoordsAndSize(targetSectionEl.getBoundingClientRect(), worldRect);
            const targetNodesWrap = getCoordsAndSize(targetNodesWrapEl.getBoundingClientRect(), worldRect);

            const snakeReverse = targetSection.center.x <= targetNodesWrap.center.x;

            const stack = stackSection.stack;

            for (let i = 0; i < stack.length; i++) {
                const { node, pathDirection } = snakeGrid(stack, i, snakeReverse);

                const targetNodeWrapEl = worldEl.querySelector(
                    `[data-id="${node.nodeName}"]`
                ) as HTMLElement | null;

                const targetNodeEl = worldEl.querySelector(
                    `[data-id="node-${node.nodeName}"]`
                ) as HTMLElement | null;

                if (!targetNodeEl || !targetNodeWrapEl) continue;

                const targetNodeWrap = getCoordsAndSize(
                    targetNodeWrapEl.getBoundingClientRect(),
                    worldRect
                );

                const targetNode = getCoordsAndSize(
                    targetNodeEl.getBoundingClientRect(),
                    worldRect
                );

                map[node.nodeName] = (() => {
                    const sectionStart =
                        targetSection.center.y >= targetNodesWrap.center.y
                            ? targetSection.topCenter
                            : targetSection.bottomCenter;

                    const nodeEnd =
                        pathDirection === "top"
                            ? targetNode.topCenter
                            : targetNode.bottomCenter;

                    const nodeWrapEnd =
                        pathDirection === "top"
                            ? targetNodeWrap.topCenter
                            : targetNodeWrap.bottomCenter;

                    const currentGridGap =
                        pathDirection === "top" ? -gridGap / 2 : gridGap / 2;

                    const horizontalGap =
                        snakeReverse ?
                            targetSection.center.y <= targetNodesWrap.center.y
                                ? -calcGap(stack.length, i)
                                : calcGap(stack.length, i)
                            :
                            targetSection.center.y <= targetNodesWrap.center.y
                                ? calcGap(stack.length, i)
                                : -calcGap(stack.length, i);

                    const verticalGap =
                        snakeReverse ?
                            targetSection.center.x <= targetNodesWrap.center.x
                                ? calcGap(stack.length, i)
                                : -calcGap(stack.length, i)
                            :
                            targetSection.center.x <= targetNodesWrap.center.x
                                ? -calcGap(stack.length, i)
                                : calcGap(stack.length, i);

                    return `
                        M ${sectionStart.x + horizontalGap} ${sectionStart.y}
                        L ${sectionStart.x + horizontalGap} ${nodeWrapEnd.y + verticalGap + currentGridGap}
                        L ${nodeEnd.x} ${nodeWrapEnd.y + verticalGap + currentGridGap}
                        L ${nodeEnd.x} ${nodeEnd.y}
                    `;
                })();
            }
        });

        setNodesPaths(map)
    }, [])
    useLayoutEffect(() => {
        const map: Record<string, string> = {}

        const worldEl = worldRef.current;
        if (!worldEl) return;
        const worldRect = worldEl.getBoundingClientRect();

        techStack.forEach((stackSection) => {
            stackSection.stack.forEach((node) => {

                const targetNodeEl = worldEl.querySelector(`[data-id="node-${node.nodeName}"]`) as HTMLElement | null;
                if (!targetNodeEl) return;
                const targetNode = getCoordsAndSize(targetNodeEl.getBoundingClientRect(), worldRect);
                node.subnodes?.forEach((sub) => {

                    const targetSubNodeEl = worldEl.querySelector(`[data-id="subNode-${sub.nodeName}"]`) as HTMLElement | null;
                    if (!targetSubNodeEl) return;
                    const targetSubNode = getCoordsAndSize(targetSubNodeEl.getBoundingClientRect(), worldRect);
                    map[sub.nodeName] = (() => {

                        const getDirection = () => {
                            if (targetSubNode.bottom <= targetNode.top) return 'top';
                            if (targetSubNode.top >= targetNode.bottom) return 'bottom';
                            if (targetSubNode.right <= targetNode.left) return 'left';
                            if (targetSubNode.left >= targetNode.right) return 'right';
                        }

                        const getPathCords = () => {
                            switch (getDirection()) {
                                case "top":
                                    if (targetSubNode.rightCenter.x <= targetNode.topCenter.x) {
                                        return {
                                            nodeStart: {
                                                x: targetNode.left + targetNode.width / 5,
                                                y: targetNode.top
                                            },
                                            subNodeEnd: {
                                                x: targetNode.left + targetNode.width / 5,
                                                y: targetSubNode.bottom
                                            }
                                        }
                                    } else {
                                        return {
                                            nodeStart: {
                                                x: targetNode.right - targetNode.width / 5,
                                                y: targetNode.top
                                            },
                                            subNodeEnd: {
                                                x: targetNode.right - targetNode.width / 5,
                                                y: targetSubNode.bottom
                                            }
                                        }
                                    }
                                case "bottom":
                                    if (targetSubNode.rightCenter.x <= targetNode.topCenter.x) {
                                        return {
                                            nodeStart: {
                                                x: targetNode.left + targetNode.width / 5,
                                                y: targetNode.bottom
                                            },
                                            subNodeEnd: {
                                                x: targetNode.left + targetNode.width / 5,
                                                y: targetSubNode.top
                                            }
                                        }
                                    } else {
                                        return {
                                            nodeStart: {
                                                x: targetNode.right - targetNode.width / 5,
                                                y: targetNode.bottom
                                            },
                                            subNodeEnd: {
                                                x: targetNode.right - targetNode.width / 5,
                                                y: targetSubNode.top
                                            }
                                        }
                                    }
                                case "left":
                                    return {
                                        nodeStart: {
                                            x: targetNode.left,
                                            y: targetSubNode.rightCenter.y
                                        },
                                        subNodeEnd: {
                                            x: targetSubNode.rightCenter.x,
                                            y: targetSubNode.rightCenter.y
                                        }
                                    }
                                case "right":
                                    return {
                                        nodeStart: {
                                            x: targetNode.right,
                                            y: targetSubNode.leftCenter.y
                                        },
                                        subNodeEnd: {
                                            x: targetSubNode.leftCenter.x,
                                            y: targetSubNode.leftCenter.y
                                        }
                                    }
                            }


                        }

                        const cords = getPathCords();
                        if (!cords) return ``;

                        const { nodeStart, subNodeEnd } = cords;

                        return `
                                M ${nodeStart.x} ${nodeStart.y}
                                L ${subNodeEnd.x} ${subNodeEnd.y}
                                `;
                    })();
                })
            })
        });

        setSubNodesPaths(map)
    }, [])

    useEffect(() => {
        if (!ballState.isActive) return;

        const ball = ballRef.current;
        const world = worldRef.current;
        if (!world || !ball) return;

        const paths: SVGPathElement[] = [];

        const sectionPath = world.querySelector(
            `[data-id="path-${ballState.section}"]`
        ) as SVGPathElement | null;
        sectionPath && paths.push(sectionPath);

        if (ballState.parentNode) {
            const nodePath = world.querySelector(
                `[data-id="path-${ballState.parentNode}"]`
            ) as SVGPathElement | null;
            nodePath && paths.push(nodePath);

            const subPath = world.querySelector(
                `[data-id="path-${ballState.node}"]`
            ) as SVGPathElement | null;
            subPath && paths.push(subPath);
        } else {
            const nodePath = world.querySelector(
                `[data-id="path-${ballState.node}"]`
            ) as SVGPathElement | null;
            nodePath && paths.push(nodePath);
        }
        if (!paths.length) return;

        const lengths = paths.map(p => p.getTotalLength());
        const totalLength = lengths.reduce((a, b) => a + b, 0);

        let distance = 0;
        let lastTime: number | null = null;

        const animate = (time: number) => {
            if (lastTime === null) {
                lastTime = time;
                requestAnimationFrame(animate);
                return;
            }

            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            distance += ballSpeed * deltaTime;

            let accumulated = 0;

            for (let i = 0; i < paths.length; i++) {
                const pathLength = lengths[i];

                if (distance <= accumulated + pathLength) {
                    const localDistance = distance - accumulated;
                    const point = paths[i].getPointAtLength(localDistance);

                    ball.setAttribute("cx", point.x.toString());
                    ball.setAttribute("cy", point.y.toString());
                    break;
                }

                accumulated += pathLength;
            }

            if (distance < totalLength) {
                requestAnimationFrame(animate);
            } else {
                setBallState((prev: any) => ({
                    ...prev,
                    isActive: false,
                    destinationReached: true,
                }));
            }
        };

        const startPoint = paths[0].getPointAtLength(0);
        ball.setAttribute("cx", startPoint.x.toString());
        ball.setAttribute("cy", startPoint.y.toString());

        requestAnimationFrame(animate);

    }, [ballState.isActive]);


    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="pcb-paths">
            {ballState.isActive &&
                <circle ref={ballRef} className="ball" />
            }
            {techStack.map((stackSection, i) => (
                <React.Fragment key={`path-${stackSection.sectionName}${i}`}>
                    <path
                        className="path-section"
                        data-id={`path-${stackSection.sectionName}`}
                        d={sectionPaths[stackSection.sectionName]}
                    />
                    {stackSection.stack.map((node, j) => (
                        <React.Fragment key={`path-${node.nodeName}${j}`}>
                            <path
                                className="node-section"
                                data-id={`path-${node.nodeName}`}
                                d={nodesPaths[node.nodeName]}
                            />
                            {node.subnodes?.map((sub, k) => (
                                <path
                                    className="subNode-section"
                                    key={`path-${sub.nodeName}${k}`}
                                    data-id={`path-${sub.nodeName}`}
                                    d={subNodesPaths[sub.nodeName]}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </svg>
    )
}
