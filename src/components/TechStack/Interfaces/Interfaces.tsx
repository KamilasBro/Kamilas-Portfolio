import React, { Dispatch, SetStateAction } from 'react';

//TechStack
export interface TechStackPropsInterface {
    buildMode: boolean;
    setFreeze: Dispatch<SetStateAction<boolean>>;
    zoomRange?: {
        min: number;
        max: number;
    };
    spacingMult?: number;
    gridGap?: number;
    pathGap?: number;
    ballSpeed?: number
}
export interface TechStackInterface {
    sectionName: string;
    stack: {
        nodeName: string;
        subnodes?: {
            nodeName: string;
        }[];
    }[];
}

//Engine
export interface TechStackEnginePropsInterface {
    zoomRange?: {
        min: number;
        max: number;
    };
    spacingMult?: number;
    buildMode: boolean;
    setFreeze: Dispatch<SetStateAction<boolean>>;
}

export interface ConfigInterface {
    elements?: Record<string, {
        x: number;
        y: number;
    }>,
    translateLimits?: Partial<{
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }>
}

//Paths
export interface TechStackPathsPropsInterface {
    techStack: TechStackInterface[]
    worldRef: React.RefObject<HTMLDivElement>
    logoRef: React.RefObject<HTMLDivElement>
    gridGap?: number,
    pathGap?: number,
    snakeGrid: any,
    ballSpeed?: number,
    ballState: any,
    setBallState: any,
}