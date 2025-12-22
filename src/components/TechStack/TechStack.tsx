import React, { useState, useEffect, useRef } from "react";
import "./techStack.scss";
import techStack from "../../data/techStack/techStack.json";
import coreCords from "../../data/techStack/coreCords.json";
import { ReactComponent as LogoSvg } from "../../images/techStack/logo.svg";

import { useInView } from "react-intersection-observer";

// TechStack component
// This component renders an interactive "circuit board" like visualization of the
// project's tech stack. Each technology is represented as a node (an li element)
// and there are SVG paths connecting a central core to section labels, to main
// nodes, and to subnodes. Clicking a node animates a small "ball" (SVG circle)
// along the path to the clicked node and highlights the clicked node when the
// animation finishes.
export default function TechStack() {
  const { ref, inView } = useInView({
    // see projects.js for explanation in this codebase
    triggerOnce: true,
  });

  // ballRef points to the small SVG circle used for the travel animation.
  const ballRef = useRef<SVGCircleElement>(null);

  // corePos stores coordinates for the central core for each section (comes
  // from coreCords.json). We initialize to the first entry and update when the
  // container size / breakpoint changes so lines point correctly.
  const [corePos, setCorePos] = useState(coreCords[0].corePos)

  // triggerPathsSwitch is used during path generation to alternate the vertical
  // offset of paths so they don't overlap too much. It's mutated inside render
  let triggerPathsSwitch = false;

  // ballState controls the animation lifecycle. When isActive is true the
  // animation useEffect (below) runs and animates the ball along concatenated
  // SVG paths computed from section/main/sub node path keys.
  const [ballState, setBallState] = useState<{
    isActive: boolean;
    targetNode: string; // the data-node name to mark active after animation
    section: string; // which PCB section the target belongs to
    mainNode?: string;
    subNode?: string;
  }>({
    isActive: false,
    targetNode: "",
    section: "",
  });

  // containerWidth is updated by a ResizeObserver. We include it in the
  // dependency list of the animation (and breakpoint logic) so positions are
  // recalculated when the container changes size.
  const [containerWidth, setContainerWidth] = useState(0);
  const pcbRef = useRef<HTMLDivElement>(null);

  // When container resizes (or on mount) compute which core positions to use
  // by matching the current window width against breakpoints defined in
  // coreCords.json. Also attach a ResizeObserver so we can react to layout
  // changes (helpful when the window resizes or the component is reflowed).
  useEffect(() => {
    if (!pcbRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // update container width; this will re-run this effect and other
        // effects that depend on this value
        setContainerWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(pcbRef.current);

    if (window.innerWidth >= coreCords[0].breakpoint) {
      setCorePos(coreCords[0].corePos);
    } else {
      coreCords.forEach((ele) => {
        if (window.innerWidth <= ele.breakpoint) {
          setCorePos(ele.corePos);
        }

      });
    }


    return () => resizeObserver.disconnect();
  }, [containerWidth]);

  // currentIndexRef keeps the animation index across animation frames without
  // causing re-renders (mutable ref). It increments as the ball moves along a
  // precomputed array of points.
  const currentIndexRef = useRef(0);

  // store the animationFrame id so we can cancel it on cleanup
  const animationFrameIdRef = useRef<number | null>(null);

  // When ballState.isActive becomes true we start animating the ball along a
  // concatenation of path traces. The animation uses requestAnimationFrame for
  // smooth movement and updates the <circle> cx/cy attributes directly.
  useEffect(() => {
    if (!ballState.isActive) return;

    const targetNode = ballState.targetNode;

    const animate = () => {
      // Build the ordered list of path data-node keys we should trace.
      // e.g. ["path core-section", "path section-main", "path main-sub"]
      const pathKeys = [
        `path core-${ballState.section}`,
        ballState.mainNode ? `path ${ballState.section}-${ballState.mainNode}` : "",
        ballState.subNode ? `path ${ballState.mainNode}-${ballState.subNode}` : "",
      ].filter(Boolean);

      // Concatenate coordinate traces from each path into a single array.
      let pathCoords: { x: number; y: number }[] = [];
      pathKeys.forEach(key => {
        pathCoords = pathCoords.concat(getPathTrace(key));
      });

      const idx = currentIndexRef.current;
      // If we've reached the end of the trace, hide the ball and stop.
      // Instead of adding .active on click, add it here once the ball arrives.
      if (idx >= pathCoords.length) {
        if (ballRef.current) ballRef.current.style.display = "none";

        // add .active to the target node now that animation finished
        if (targetNode) {
          // remove any leftover 'deactivated' on the target (we want it active)
          const container = pcbRef.current;
          const targetEl = container?.querySelector(`[data-node="${targetNode}"]`) as HTMLElement | null;
          if (targetEl) {
            targetEl.classList.remove("deactivated");
            targetEl.classList.add("active");
          }
        }

        setBallState(prev => ({ ...prev, isActive: false, targetNode: "" }));
        animationFrameIdRef.current = null;
        return;
      }

      // Move the ball to the next point in the trace
      const { x, y } = pathCoords[idx];
      if (ballRef.current) {
        ballRef.current.setAttribute("cx", x.toString());
        ballRef.current.setAttribute("cy", y.toString());
        ballRef.current.style.display = "block";
      }

      // advance and schedule the next frame
      currentIndexRef.current += 1;
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // start animation from beginning
    currentIndexRef.current = 0;
    animationFrameIdRef.current = requestAnimationFrame(animate);

    // cleanup cancels the animation frame if the component unmounts or if
    // dependencies change
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [
    ballState.isActive,
    ballState.targetNode,
    ballState.section,
    ballState.mainNode,
    ballState.subNode,
    containerWidth,
  ]);

  // Called when a user clicks a node. We compute the path keys and if the
  // concatenated trace is non-empty we set ballState to start the animation.
  const handleNodeClick = (section: string, mainNode: string, subNode?: string) => {
    // block clicks while an animation is running
    if (ballState.isActive) return;
    const coreEl = document.querySelector(".core");
    if (coreEl) {
      coreEl.classList.remove("triggered");
      // schedule add on next frame to force the animation to restart
      requestAnimationFrame(() => coreEl.classList.add("triggered"));
    }

    currentIndexRef.current = 0;
    if (ballRef.current) ballRef.current.style.display = "none";

    const pathKeys: string[] = [
      `path core-${section}`,
      mainNode ? `path ${section}-${mainNode}` : "",
      subNode ? `path ${mainNode}-${subNode}` : "",
    ].filter(Boolean);

    // quickly check if there are points to animate along for these keys
    let pathCoords: { x: number; y: number }[] = [];
    pathKeys.forEach(key => {
      pathCoords = pathCoords.concat(getPathTrace(key));
    });

    if (pathCoords.length > 0) {
      // 1) remove any leftover 'deactivated' markers
      const container = pcbRef.current;
      container?.querySelectorAll(".deactivated").forEach(el => el.classList.remove("deactivated"));

      // 2) demote the current active node to 'deactivated' (if any) scoped to pcb
      const prevActive = container?.querySelector(".active") as HTMLElement | null;
      if (prevActive) {
        prevActive.classList.remove("active");
        prevActive.classList.add("deactivated");
      }

      // NOTE: do NOT mark clicked node as .active here — wait until
      // the ball reaches the target (handled in the animation completion above)

      // start animation towards the clicked node
      setBallState({
        isActive: true,
        targetNode: subNode || mainNode,
        section: section,
        mainNode: mainNode,
        subNode: subNode,
      });
    }
  };

  // getNodeXY: returns 4 anchor points (topMiddle, bottomMiddle, leftMiddle,
  // rightMiddle) for the element identified by data-node. Coordinates are
  // relative to the .pcb container so they map directly to the SVG coordinate
  // space used by the paths.
  function getNodeXY(nodeName: string) {
    const el = document.querySelector(`[data-node="${nodeName}"]`);
    const container = pcbRef.current;
    if (!el || !container) return null;

    const elBox = el.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();

    return {
      topMiddle: {
        x: elBox.left - containerBox.left + elBox.width / 2,
        y: elBox.top - containerBox.top,
      },
      bottomMiddle: {
        x: elBox.left - containerBox.left + elBox.width / 2,
        y: elBox.top - containerBox.top + elBox.height,
      },
      leftMiddle: {
        x: elBox.left - containerBox.left,
        y: elBox.top - containerBox.top + elBox.height / 2,
      },
      rightMiddle: {
        x: elBox.left - containerBox.left + elBox.width,
        y: elBox.top - containerBox.top + elBox.height / 2,
      },
    };
  }

  // comparePositions picks whichever of pos1 or pos2 is closer to pos3. Used
  // to decide which side of a node to connect paths to depending on where the
  // core/section sits.
  function comparePositions(pos1: number, pos2: number, pos3: number) {
    if (Math.abs(pos3 - pos1) < Math.abs(pos3 - pos2)) {
      return pos1;
    } else {
      return pos2;
    }
  }

  // getPathTrace: sample points along an SVG <path> using the path's
  // getTotalLength/getPointAtLength APIs. 'step' controls sampling density.
  // This turns an SVG path into an array of {x,y} coordinates for animation.
  function getPathTrace(pathData: string, step = 2) {
    const path = document.querySelector(`[data-node="${pathData}"]`) as SVGPathElement;
    if (!path) return [];

    const length = path.getTotalLength();
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= length; i += step) {
      const pt = path.getPointAtLength(i);
      points.push({ x: pt.x, y: pt.y });
    }

    return points;
  }

  return (
    <section
      className="tech-stack"
      ref={ref}
      style={inView === true ?
        { animation: "titleAnim 1s" }
        :
        { visibility: "hidden" }}>
      <h1
        className="section-title"
        // when the section enters the viewport, play a simple title animation
        style={inView === true ? { animation: "titleAnim 1s" } : {}}
      >
        Tech Stack
      </h1>
      <div
        className="pcb-note"
        style={inView === true ? { animation: "titleAnim 1.25s" } : {}}>
        You can click on the nodes
      </div>
      <div className="pcb" ref={pcbRef}>
        <ul className="pcb-components">
          {techStack.map((comp, idx) => (
            // Each "comp" is a section on the PCB (frontend, backend, etc.)
            <ul
              key={idx}
              className={`pcb-component`}
            >
              {comp.stack.map((node, idy) => (
                // nodes: a main node and its subnodes are grouped here. We add
                // a data-node attribute so getNodeXY and path lookup can find
                // the element in the DOM.
                <ul key={idy} className={`nodes ${node.nodeName.toLowerCase()}`}>
                  <li
                    className={`${node.type}`}
                    data-node={node.nodeName}
                    onClick={() => { handleNodeClick(comp.section, node.nodeName) }}
                  >
                    <img src={require(`../../images/techStack/${node.svgName}.svg`)} alt={node.nodeName} />
                    <span>{node.nodeName}</span>
                  </li>
                  {node.subnodes.map((subnode, idz) => (
                    <li
                      key={idz}
                      className={`${subnode.type}`}
                      data-node={subnode.nodeName}
                      onClick={() => { handleNodeClick(comp.section, node.nodeName, subnode.nodeName) }}
                    >
                      <img src={require(`../../images/techStack/${subnode.svgName}.svg`)} alt={node.nodeName} />
                      <span>{subnode.nodeName}</span>
                    </li>
                  ))}
                </ul>
              ))}
              {/* Section label (e.g. "Frontend") - used as a connection anchor */}
              <li className={`pcb-section`} data-node={comp.section}>{comp.section}</li>
            </ul>
          ))}
        </ul>

        {/* SVG paths layer: these are generated using getNodeXY which measures
            DOM elements at render time. If positions aren't available yet the
            path elements are not rendered (we return null). */}
        <div className="paths">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            {techStack.map((comp, idx) => {
              const compXY = getNodeXY(comp.section);
              if (!compXY) return null; // can't draw without measured coordinates
              return (
                <React.Fragment key={`core-section path ${idx}`}>
                  {/* Path from core to section */}
                  <path
                    data-node={`path core-${comp.section}`}
                    d={`
                    M ${corePos[idx].x} ${corePos[idx].y}
                    L ${compXY.bottomMiddle.x} ${corePos[idx].y}
                    L ${compXY.bottomMiddle.x} ${comparePositions(compXY.topMiddle.y, compXY.bottomMiddle.y, corePos[idx].y)}`}
                    strokeWidth="4"
                  />

                  {/* For each main node in the section, draw a path from the
                      section anchor to the node. The code computes an offset so
                      multiple nodes spread vertically and don't overlap. */}
                  {comp.stack
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((node, idy, sorted) => {
                      const nodeXY = getNodeXY(node.nodeName);
                      if (!nodeXY) return null;

                      // spacing algorithm: spread nodes with a small gap and
                      // alternate direction using triggerPathsSwitch to avoid
                      // monotonic stacking.
                      const n = sorted.length;
                      const gap = 4;
                      const offset = (idy - (n - 1) / 2) * gap;
                      let offsetY;
                      if (idy % 3 === 0) {
                        // flip switch periodically to create a staggered look
                        triggerPathsSwitch = !triggerPathsSwitch
                      }
                      if (triggerPathsSwitch) {
                        offsetY = - 10 - (idy - (n - gap) / 2) * gap
                      } else {
                        offsetY = - 10 + (idy - (n + gap) / 2) * gap
                      }

                      return (
                        <React.Fragment key={`section-mainnode path ${idy}`}>
                          <path
                            data-node={`path ${comp.section}-${node.nodeName}`}
                            d={idx !== 2 ?
                              `
                              M ${compXY.topMiddle.x + offset} ${compXY.topMiddle.y}
                              L ${compXY.topMiddle.x + offset} ${compXY.topMiddle.y + offsetY}
                              L ${nodeXY.topMiddle.x} ${compXY.topMiddle.y + offsetY}
                              L ${nodeXY.topMiddle.x} ${comparePositions(nodeXY.topMiddle.y, nodeXY.bottomMiddle.y, compXY.topMiddle.y)}
                            `
                              :
                              `
                              M ${compXY.bottomMiddle.x} ${compXY.bottomMiddle.y}
                              L ${compXY.bottomMiddle.x} ${nodeXY.leftMiddle.y}
                              L ${comparePositions(nodeXY.leftMiddle.x, nodeXY.rightMiddle.x, compXY.bottomMiddle.x)} ${nodeXY.leftMiddle.y}
                            `
                            }
                            strokeWidth="2"
                          />

                          {/* Draw paths for subnodes (if any). They connect the main
                              node to each subnode. */}
                          {node.subnodes && node.subnodes.map((subnode, idz) => {
                            const subNodeXY = getNodeXY(subnode.nodeName);
                            if (!subNodeXY) return null;
                            return (
                              <path
                                key={`section-subnode path ${idz}`}
                                data-node={`path ${node.nodeName}-${subnode.nodeName}`}
                                d={idz === 0 ?
                                  `M ${subNodeXY.bottomMiddle.x} ${nodeXY.topMiddle.y}
                                  L ${subNodeXY.bottomMiddle.x} ${subNodeXY.bottomMiddle.y}`
                                  :
                                  `M ${nodeXY.rightMiddle.x} ${subNodeXY.leftMiddle.y}
                                  L ${subNodeXY.leftMiddle.x} ${subNodeXY.leftMiddle.y}`
                                }
                                strokeWidth="2"
                              />
                            )
                          })}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              )
            })}
          </svg>

          {/* Separate SVG layer for the animated ball so its coordinates map to*/}
          <svg className="ball" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <circle ref={ballRef} cx={0} cy={0} r="3" />
          </svg>
        </div>

        {/* central core logo */}
        <div className="core"><LogoSvg /></div>
      </div>
    </section >
  );
}
