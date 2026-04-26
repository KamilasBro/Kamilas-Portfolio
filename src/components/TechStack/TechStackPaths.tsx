import { TechStackPathsPropsInterface } from "./Interfaces/Interfaces";

import React, { useEffect, useRef, useLayoutEffect, useState } from "react"

// TechStackPaths renders dynamic SVG paths for a tech stack diagram.
// It computes coordinates relative to a "world" container and optionally animates a ball along these paths.
export default function TechStackPaths({
    // ref to container of all tech stack elements
    worldRef,
    // ref to the central logo (origin for section paths)
    logoRef,
    // spacing between stacked nodes
    gridGap = 60,
    // spacing between parallel paths
    pathGap = 8,
    // function defining node order and path direction
    snakeGrid,
    // pixels/sec for ball animation
    ballSpeed = 800,
    // object holding current ball animation state
    ballState,
    // setter to update ball state
    setBallState,
    // array of section -> nodes -> subnodes
    techStack
}: TechStackPathsPropsInterface) {
    const gap = pathGap;
    // ref to SVG ball element
    const ballRef = useRef<SVGCircleElement>(null);

    // Calculates horizontal offset for parallel paths to avoid overlap
    const calcGap = (length: number, i: number) => {
        // Center multiple paths around the middle, spread evenly
        return gap * i - gap * (length - 1) / 2;
    }

    // State objects to store SVG path strings
    const [sectionPaths, setSectionPaths] = useState<Record<string, string>>({});
    const [nodesPaths, setNodesPaths] = useState<Record<string, string>>({});
    const [subNodesPaths, setSubNodesPaths] = useState<Record<string, string>>({});

    // Returns element coordinates relative to the world container
    // Includes left, right, top, bottom, and center positions for convenience
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

    //I decided to seperate generating paths for each section for clarity
    //that cost me multiple loops instead of 3 necessary
    //we ignore dependencies cause paths suppose to be painted only once (thats by the design)
    //return value are coordinates (svg path d)

    //generate paths from logo to section name
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
                //determine starting and ending point for path
                //0 is center of world and logo is in center
                const logoStart = target.center.x <= 0
                    //paths starts from left side of logo
                    ? { x: logo.leftCenter.x, y: logo.leftCenter.y + calcGap(techStack.length, i) }
                    //paths starts from right side of logo
                    : { x: logo.rightCenter.x, y: logo.rightCenter.y + calcGap(techStack.length, i) }

                const targetEnd = target.center.y <= 0
                    //paths ends at bottom side of section name
                    ? { x: target.bottomCenter.x, y: target.bottomCenter.y }
                    //paths ends at top side of section name
                    : { x: target.topCenter.x, y: target.topCenter.y }

                return `
                        M ${logoStart.x} ${logoStart.y}
                        L ${targetEnd.x} ${logoStart.y}
                        L ${targetEnd.x} ${targetEnd.y}
                        `;
            })();
        });

        setSectionPaths(map);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Generate paths from each section to its nodes.
    // The snakeGrid function prevents paths for crossing
    // Horizontal and vertical gaps are calculated to evenly space nodes around the section center.
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

            // Determine if the snake path should reverse horizontally
            const snakeReverse = targetSection.center.x <= targetNodesWrap.center.x;

            const stack = stackSection.stack;

            for (let i = 0; i < stack.length; i++) {
                const { node, pathDirection } = snakeGrid(stack, i, snakeReverse);

                const targetNodeWrapEl = worldEl.querySelector(`[data-id="${node.nodeName}"]`) as HTMLElement | null;
                const targetNodeEl = worldEl.querySelector(`[data-id="node-${node.nodeName}"]`) as HTMLElement | null;

                if (!targetNodeEl || !targetNodeWrapEl) continue;

                const targetNodeWrap = getCoordsAndSize(targetNodeWrapEl.getBoundingClientRect(), worldRect);
                const targetNode = getCoordsAndSize(targetNodeEl.getBoundingClientRect(), worldRect);

                map[node.nodeName] = (() => {
                    // Determine the starting point of the path relative to the section.
                    const sectionStart =
                        targetSection.center.y >= targetNodesWrap.center.y
                            ? targetSection.topCenter
                            : targetSection.bottomCenter;

                    // Determine the final vertical point on the node itself.
                    // If the path direction is "top", the path should end at the node's top.
                    // Otherwise, it ends at the bottom of the node.
                    const nodeEnd =
                        pathDirection === "top"
                            ? targetNode.topCenter
                            : targetNode.bottomCenter;

                    // Determine the intermediate end point at the node wrapper (used for spacing/offsets)
                    const nodeWrapEnd =
                        pathDirection === "top"
                            ? targetNodeWrap.topCenter
                            : targetNodeWrap.bottomCenter;

                    // Calculate a small vertical adjustment for the path so multiple paths don't overlap.
                    // Negative if moving upwards, positive if moving downwards.
                    const currentGridGap = pathDirection === "top" ? -gridGap / 2 : gridGap / 2;

                    // Horizontal offset at the starting point to spread out multiple paths evenly
                    // Uses snakeReverse logic to decide which direction the horizontal offset should go
                    // and takes the index (i) of the node into account via calcGap.
                    const horizontalGap =
                        snakeReverse
                            ? targetSection.center.y <= targetNodesWrap.center.y
                                // spread left if needed
                                ? -calcGap(stack.length, i)
                                // spread right if reversed
                                : calcGap(stack.length, i)
                            : targetSection.center.y <= targetNodesWrap.center.y
                                // spread right normally
                                ? calcGap(stack.length, i)
                                // spread left normally
                                : -calcGap(stack.length, i);

                    // Vertical offset at the intermediate path segment to adjust for multiple nodes.
                    // Ensures paths don’t overlap and follow a consistent "snake" layout.
                    const verticalGap =
                        snakeReverse
                            ? targetSection.center.x <= targetNodesWrap.center.x
                                // adjust down
                                ? calcGap(stack.length, i)
                                // adjust up if reversed
                                : -calcGap(stack.length, i)
                            : targetSection.center.x <= targetNodesWrap.center.x
                                // adjust up normally
                                ? -calcGap(stack.length, i)
                                // adjust down normally
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

        setNodesPaths(map);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Generate paths from nodes to their subnodes
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

                // Loop over each subnode of the current node if any exists
                node.subnodes?.forEach((sub) => {
                    const targetSubNodeEl = worldEl.querySelector(`[data-id="subNode-${sub.nodeName}"]`) as HTMLElement | null;
                    if (!targetSubNodeEl) return;

                    const targetSubNode = getCoordsAndSize(targetSubNodeEl.getBoundingClientRect(), worldRect);

                    map[sub.nodeName] = (() => {
                        // Determine the relative direction of the subnode to the node
                        // This decides which side the path should start/end from
                        const getDirection = () => {
                            // subnode is above node
                            if (targetSubNode.bottom <= targetNode.top) return 'top';
                            // subnode is below node
                            if (targetSubNode.top >= targetNode.bottom) return 'bottom';
                            // subnode is to the left
                            if (targetSubNode.right <= targetNode.left) return 'left';
                            // subnode is to the right
                            if (targetSubNode.left >= targetNode.right) return 'right';
                        }

                        // Compute the start and end coordinates for the path based on direction
                        const getPathCords = () => {
                            switch (getDirection()) {
                                case "top":
                                    // If subnode is to the top-left of node, start path from left side of node top
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
                                        // Otherwise, start from right side of node top
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
                                    // Same logic as top, but path goes downward
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
                                    // Path from left of node to right of subnode
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
                                    // Path from right of node to left of subnode
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

        // Save all generated subnode paths in state
        setSubNodesPaths(map)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //ball animation
    useEffect(() => {
        //ball is activated via clicking node
        if (!ballState.isActive) return;

        const ball = ballRef.current;
        const world = worldRef.current;
        if (!world || !ball) return;

        // Collect all paths the ball should follow
        const paths: SVGPathElement[] = [];

        // First path: section-level path (from logo to section)
        const sectionPath = world.querySelector(
            `[data-id="path-${ballState.section}"]`
        ) as SVGPathElement | null;
        sectionPath && paths.push(sectionPath);

        // If the ball is moving through a node hierarchy, include parent node and subnode paths
        if (ballState.parentNode) {
            // Path from section to parent node
            const nodePath = world.querySelector(
                `[data-id="path-${ballState.parentNode}"]`
            ) as SVGPathElement | null;
            nodePath && paths.push(nodePath);

            // Path from parent node to child subnode
            const subPath = world.querySelector(
                `[data-id="path-${ballState.node}"]`
            ) as SVGPathElement | null;
            subPath && paths.push(subPath);
        } else {
            // Otherwise, only include path from section to node
            const nodePath = world.querySelector(
                `[data-id="path-${ballState.node}"]`
            ) as SVGPathElement | null;
            nodePath && paths.push(nodePath);
        }

        // If no valid paths were found, exit
        if (!paths.length) return;

        // Compute lengths of all paths and the total length
        const lengths = paths.map(p => p.getTotalLength());
        const totalLength = lengths.reduce((a, b) => a + b, 0);

        // Initialize animation state

        let totalDistance = 0;
        // timestamp of last animation frame
        let lastTime: number | null = null;

        // Animation function using requestAnimationFrame
        const animate = (time: number) => {
            if (lastTime === null) {
                // First frame, initialize lastTime
                lastTime = time;
                requestAnimationFrame(animate);
                return;
            }

            // Calculate delta time since last frame in seconds
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            // Update distance along paths based on speed
            totalDistance += ballSpeed * deltaTime;

            let accumulatedLength = 0;

            // Iterate through each path to find the segment where the ball currently is
            for (let i = 0; i < paths.length; i++) {
                const pathLength = lengths[i];

                if (totalDistance <= accumulatedLength + pathLength) {
                    // Ball is on this path
                    const localDistance = totalDistance - accumulatedLength;
                    const point = paths[i].getPointAtLength(localDistance);

                    // Move ball to the current point on path
                    ball.setAttribute("cx", point.x.toString());
                    ball.setAttribute("cy", point.y.toString());
                    break;
                }

                accumulatedLength += pathLength;  // move to next path segment
            }

            // Continue animation if ball hasn't reached end of all paths
            if (totalDistance < totalLength) {
                requestAnimationFrame(animate);
            } else {
                // Ball reached the final destination
                setBallState((prev: any) => ({
                    ...prev,
                    isActive: false,
                    destinationReached: true,
                }));
            }
        };

        // Set initial position of the ball to the start of the first path
        const startPoint = paths[0].getPointAtLength(0);
        ball.setAttribute("cx", startPoint.x.toString());
        ball.setAttribute("cy", startPoint.y.toString());

        // Start the animation
        requestAnimationFrame(animate);

    }, [ballState, ballSpeed, setBallState, worldRef]);


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
