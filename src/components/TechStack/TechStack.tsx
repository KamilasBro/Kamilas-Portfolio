import React, { useState } from 'react';

import { TechStackInterface } from './Interfaces/Interfaces';
import { TechStackPropsInterface } from './Interfaces/Interfaces';

import "./techStack.scss";
import useFontsLoaded from '../Utilities/useFontsLoaded';

import { ReactComponent as LogoSvg } from "../../images//logo/logoGradient.svg";
import { ReactComponent as OpenFullScreen } from "../../images/techStack/functional/openFullScreen.svg"
import { ReactComponent as CloseFullScreen } from "../../images/techStack/functional/closeFullScreen.svg"

import techStackJSON from "../../data/techStack/techStack.json";
import getTechStackImg from '../Utilities/getTechStackImg';

import useTechStackEngine from './useTechStackEngine';
import TechStackPaths from './TechStackPaths';


//we pass options as props, optional one will go to TechStackPaths
export default function TechStack({
    zoomRange,
    spacingMult, // in precentages
    buildMode,
    setFreeze,
    gridGap,
    pathGap,
    ballSpeed
}: TechStackPropsInterface) {
    const techStack = techStackJSON as TechStackInterface[];
    //getting necessary things from engine file
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
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,

        //BUILD MODE
        handleCopyConfig,
        handleReset,
    } = useTechStackEngine({
        zoomRange,
        spacingMult,
        buildMode,
        setFreeze,
    });

    //both related stuff is kept in here instead of engine

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

    however elements render is using only pathDirection in class for scss styling
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

            //state for ball (imitation of paths current)
            setBallState(({
                isActive: true,
                section: targetSection,
                node: targetNode,
                parentNode: targetParentNode,
                destinationReached: false
            }));
        }
    }

    //state for detecting if class should change
    const [previousNode, setPreviousNode] = useState<string | null>(null);

    const handleClassChange = (targetNode: string) => {
        const isActive =
            ballState.node === targetNode && ballState.destinationReached;

        const isDeactivating =
            previousNode === targetNode && ballState.node !== targetNode;

        return `${isActive ? "active" : ""} ${isDeactivating ? "deactivating" : ""}`;
    };

    return (
        <section className='test-stack tech-stack'>
            <h1 className='section-title '>Tech Stack</h1>
            <span className='pcb-note'>
                Interact by scrolling, dragging, clicking or use menu below.
            </span>
            <div className={`pcb-wrap ${fullScreen ? "full-screen" : ""}`}>
                <div className='pcb-menu-wrap'>
                    <div className='pcb-menu'>
                        {buildMode && <>
                            <h3>Build Mode</h3>
                            <button onClick={() => setInitLoaded((prev) => !prev)}>
                                {!initLoaded ? "Show" : "Hide"} Paths
                            </button>
                            <button onClick={handleReset}>Reset ViewPort</button>
                            <button onClick={handleCopyConfig}>Copy Config</button>
                        </>
                        }
                        <p>Full Screen {" "}
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
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
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
                        {/*
                        Rendering paths glitch explained:

                        1. When the component initially renders, the custom font defined in SCSS
                            might not have loaded yet. During this time, the browser falls back
                            to a default system font (the “placeholder font”).

                        2. Because the placeholder font has different character widths,
                            text inside nodes and section names is slightly wider or narrower
                            than it will be once the correct font loads.

                        3. TechStackPaths are rendered only once after init is done,
                            so the paths are calculated based on the initial widths of the text
                            using the fallback font.

                        4. When the custom font finishes loading, text widths update to their
                            correct sizes, but the paths have already been drawn. This results
                            in a small offset between the paths and their corresponding nodes.

                        5. The visible effect is a few-pixel misalignment between nodes and paths,
                            which only occurs on the first render before the font is fully loaded.

                        that's why this hook is used
                        */}
                        {useFontsLoaded() && initLoaded && (
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
