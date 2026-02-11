import React, { Dispatch, SetStateAction } from 'react';
import "./techStack.scss";
import techStack from "../../data/techStack/techStack.json";

import useTechStackEngine from './useTechStackEngine';
import TechStackPaths from './TechStackPaths';

import { ReactComponent as LogoSvg } from "../../images//logo/logoGradient.svg";
import { ReactComponent as OpenFullScreen } from "../../images/techStack/functional/openFullScreen.svg"
import { ReactComponent as CloseFullScreen } from "../../images/techStack/functional/closeFullScreen.svg"

interface TechStackProps {
    zoomRange?: {
        min: number;
        max: number;
    };
    spacingMult?: number;
    buildMode: boolean;
    setFreeze: Dispatch<SetStateAction<boolean>>;
    gridGap: number;
    pathGap: number;
}

//we pass options as props, optional one will go to TechStackPaths
export default function TechStack({
    zoomRange,
    spacingMult, // in precentages
    buildMode,
    setFreeze,
    gridGap,
    pathGap
}: TechStackProps) {
    //getting necessary things from engine file
    const {
        worldRef,
        viewportRef,
        logoRef,

        translateWorld,
        scale,
        fullScreen,
        renderPaths,
        setRenderPaths,

        handleCopyConfig,

        getColumns,
        snakeGrid,

        handleReset,
        toggleFullScreen,

        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    } = useTechStackEngine({
        zoomRange,
        spacingMult,
        buildMode,
        setFreeze,
    });

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
                            <button onClick={() => setRenderPaths((prev) => !prev)}>
                                {!renderPaths ? "Show" : "Hide"} Paths
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
                            transform: `translate(${translateWorld.x}px, 
                            ${translateWorld.y}px) scale(${scale})`
                        }}>
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
                                                    className={`node-wrap path-${pathDirection}`}
                                                    key={node.nodeName + j}
                                                    data-id={`${node.nodeName}`}
                                                >
                                                    <div className={node.type}
                                                        data-id={`node-${node.nodeName}`}
                                                    >
                                                        <img
                                                            src={require(`../../images/techStack/${node.svgName}.svg`)}
                                                            alt={node.nodeName} />
                                                        {node.nodeName}
                                                    </div>
                                                    {node.subnodes?.map((sub, k) => (
                                                        <div
                                                            className={sub.type}
                                                            key={sub.nodeName + k}
                                                            data-id={`subNode-${sub.nodeName}`}
                                                        >
                                                            <img
                                                                src={require(`../../images/techStack/${sub.svgName}.svg`)}
                                                                alt={sub.nodeName} />
                                                            {sub.nodeName}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}

                                    </div>
                                    <div
                                        className={`section-name ${buildMode ? "build-mode" : ""}`}
                                        data-draggable
                                        data-id={`${stackSection.sectionName}`}
                                    >
                                        {stackSection.sectionName}
                                    </div>
                                </React.Fragment>
                            )
                        })}
                        {renderPaths &&
                            <TechStackPaths
                                worldRef={worldRef}
                                viewportRef={viewportRef}
                                logoRef={logoRef}
                                gridGap={gridGap}
                                pathGap={pathGap}
                            />}
                    </div>
                </div>
            </div>
        </section >
    );
}
