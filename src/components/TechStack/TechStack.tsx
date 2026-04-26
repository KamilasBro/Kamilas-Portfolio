import "./techStack.scss";
import { ReactComponent as LogoSvg } from "../../images//logo/logoGradient.svg";
import { ReactComponent as OpenFullScreen } from "../../images/techStack/functional/openFullScreen.svg"
import { ReactComponent as CloseFullScreen } from "../../images/techStack/functional/closeFullScreen.svg"

import { TechStackInterface } from './Interfaces/Interfaces';
import { TechStackPropsInterface } from './Interfaces/Interfaces';

import useTechStackEngine from './useTechStackEngine';
import TechStackPaths from './TechStackPaths';

import techStackJSON from "../../data/techStack/techStack.json";

import React, { useState } from 'react';
import { useInView } from "react-intersection-observer";


import getTechStackImg from '../Utilities/getTechStackImg';
import EncryptText from "../Utilities/DecryptText";

export default function TechStack({
    zoomRange,
    spacingMult, // in precentages
    buildMode, //for creating config (Dev Only)
    setFreeze,
    //bot gaps are used in paths calculations
    gridGap, // gap between nodes in grid
    pathGap, //gap between paths

    ballSpeed
}: TechStackPropsInterface) {
    const { ref, inView } = useInView({
        triggerOnce: true,
    });

    // static stack definition loaded from JSON with interface
    const techStack = techStackJSON as TechStackInterface[];
    //engine hold functionality like 
    // - drag / pan behaviour
    // - zoom handling
    // - fullscreen state
    // - build mode utilities
    const {
        //REFS
        worldRef,
        viewportRef,
        logoRef,

        //STATES
        translateWorld,
        scale,
        fullScreen,

        //INIT
        initLoaded,
        setInitLoaded,

        //HANDLERS
        toggleFullScreen,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,

        //BUILD MODE
        copyLayoutConfig,
        handleReset,
    } = useTechStackEngine({
        zoomRange,
        spacingMult,
        buildMode,
        setFreeze,
    });

    //both paths and render functionality is kept here instead of engine

    //to adjust number of columns in grid based of elements inside stack array
    const getColumns = (count: number): number => {
        //min value
        if (count <= 3) return count;

        return Math.ceil(Math.sqrt(count));
    };

    /*we manipulate order of original array to create snake layout
    (currently manipulating only order of paths so stack render is intact)
    for stack in left side of world we alternate only even rows (starting from row 0)
    1 2 3   =>  3 2 1
    4 5 6       4 5 6
    7 8 9   =>  9 8 7
    for stack in right side of world we alternate only odd rows
    1 2 3       1 2 3
    4 5 6   =>  6 5 4
    7 8 9       7 8 9

    however JSX is using only pathDirection in class for scss styling
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

    //ball state with necessary properties
    //ball simulates the current on paths
    const [ballState, setBallState] = useState<{
        isActive: boolean
        section: string;
        node: string,
        parentNode: string | null,
        destinationReached: boolean;
    }>({
        isActive: false,
        section: "",
        node: "",
        parentNode: null,
        destinationReached: false
    });

    const handleNodeClick = (
        targetSection: string,
        targetNode: string,
        targetParentNode: string | null
    ) => {
        if (!ballState.isActive && targetNode !== ballState.node && initLoaded) {
            if (ballState.node && ballState.node !== targetNode) {
                setPreviousNode(ballState.node);
            }
            setBallState(({
                isActive: true,
                section: targetSection,
                node: targetNode,
                parentNode: targetParentNode,
                destinationReached: false
            }));
        }
    }

    //state for detecting if class should change when node is inactive
    const [previousNode, setPreviousNode] = useState<string | null>(null);

    const handleClassChange = (targetNode: string) => {
        const isActive =
            ballState.node === targetNode && ballState.destinationReached;

        const isDeactivating =
            previousNode === targetNode && ballState.node !== targetNode;

        return `${isActive ? "active" : ""} ${isDeactivating ? "deactivating" : ""}`;
    };

    return (
        <section className='tech-stack' ref={ref}>
            <EncryptText
                text="Tech Stack"
                HTMLtag="h1"
                encryptInView={inView}
                className="section-title"
            />
            <EncryptText
                text="Interact by scrolling, dragging, clicking or use menu below."
                HTMLtag="span"
                encryptInView={inView}
                className="pcb-note"
                iterationsRange={1}
                decryptInterval={8}
            />
            <div className={`pcb-wrap ${fullScreen ? "full-screen" : ""} ${!inView ? "not-in-view" : ""}`}>
                <div className='pcb-menu-wrap'>
                    <div className='pcb-menu'>
                        {buildMode &&
                            <>
                                <h3>Build Mode</h3>
                                <button onClick={() => setInitLoaded((prev) => !prev)}>
                                    {!initLoaded ? "Show" : "Hide"} Paths
                                </button>
                                <button onClick={handleReset}>Reset ViewPort</button>
                                <button onClick={copyLayoutConfig}>Copy Config</button>
                            </>
                        }
                        <p>
                            Full Screen {" "}
                            <span className={fullScreen ? "full-screen" : ""}>
                                {fullScreen ? "ON" : "OFF"}
                            </span>
                        </p>
                        {!fullScreen ?
                            <OpenFullScreen onClick={toggleFullScreen} />
                            :
                            <CloseFullScreen onClick={toggleFullScreen} />
                        }
                    </div>
                </div>
                <div
                    className={`pcb ${fullScreen ? "full-screen" : ""}`}
                    ref={viewportRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <div
                        className='pcb-world'
                        ref={worldRef}
                        style={{
                            transform: `translate(${Math.round(translateWorld.x)}px, ${Math.round(translateWorld.y)}px) scale(${scale})`
                        }}
                    >
                        <div ref={logoRef} className='pcb-logo-wrap'>
                            <LogoSvg className="pcb-logo" />
                        </div>

                        {techStack.map((stackSection, i) => {
                            return (
                                <React.Fragment key={stackSection.sectionName + i}>
                                    <div
                                        className={`nodes-wrap ${buildMode ? "build-mode" : ""}`}
                                        data-draggable
                                        data-id={`nodes-${stackSection.sectionName}`}
                                        style={{
                                            gridTemplateColumns: `repeat(${getColumns(stackSection.stack.length)}, auto)`,
                                            gap: gridGap
                                        }}
                                    >
                                        {stackSection.stack.map((node, j) => {
                                            const pathDirection = snakeGrid(stackSection.stack, j).pathDirection;
                                            return (
                                                <div
                                                    className={`node-wrap path-direction-${pathDirection}`}
                                                    key={node.nodeName + j}
                                                    data-id={`${node.nodeName}`}
                                                >
                                                    <div
                                                        className={`main-node ${handleClassChange(node.nodeName)}`}
                                                        data-id={`node-${node.nodeName}`}
                                                        onClick={() => handleNodeClick(
                                                            stackSection.sectionName,
                                                            node.nodeName,
                                                            null
                                                        )}
                                                        onAnimationEnd={() => {
                                                            if (previousNode === node.nodeName) {
                                                                setPreviousNode(null);
                                                            }
                                                        }}
                                                    >
                                                        {getTechStackImg(node.nodeName)}
                                                        {node.nodeName}
                                                    </div>
                                                    {node.subnodes?.map((subNode, k) => {
                                                        return (
                                                            <div
                                                                className={`sub-node ${handleClassChange(subNode.nodeName)}`}
                                                                key={subNode.nodeName + k}
                                                                data-id={`subNode-${subNode.nodeName}`}
                                                                onClick={() => handleNodeClick(
                                                                    stackSection.sectionName,
                                                                    subNode.nodeName,
                                                                    node.nodeName
                                                                )}
                                                                onAnimationEnd={() => {
                                                                    if (previousNode === subNode.nodeName) {
                                                                        setPreviousNode(null);
                                                                    }
                                                                }}
                                                            >
                                                                {getTechStackImg(subNode.nodeName)}
                                                                {subNode.nodeName}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div
                                        className={`section-name ${buildMode ? "build-mode" : ""}`}
                                        data-draggable
                                        data-id={`${stackSection.sectionName}`}
                                    >
                                        <span>{stackSection.sectionName}</span>
                                    </div>
                                </React.Fragment>
                            )
                        })}
                        {/*Path calculation and animation logic are in TechStackPaths.*/}
                        {initLoaded && (
                            <TechStackPaths
                                techStack={techStack}
                                worldRef={worldRef}
                                logoRef={logoRef}
                                gridGap={gridGap}
                                pathGap={pathGap}
                                snakeGrid={snakeGrid}
                                ballSpeed={ballSpeed}
                                ballState={ballState}
                                setBallState={setBallState}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section >
    );
}
