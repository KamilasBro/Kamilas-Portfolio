import React, { useState, useEffect, useRef } from "react";
import "./techStack.scss";
import techStack from "../../data/techStack/techStack.json";
import { ReactComponent as LogoSvg } from "../../images/techStack/logo.svg";

import { useInView } from "react-intersection-observer";
export default function TechStack() {
  const { ref, inView } = useInView({
    //see projects.js for explanation
    triggerOnce: true,
  });
  const [corePos, setCorePos] = useState([{ x: 511, y: 269.5 }, { x: 634, y: 267.5 }, { x: 632, y: 353.5 }])
  let triggerPathsSwitch = false;

  const [containerWidth, setContainerWidth] = useState(0);
  const pcbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pcbRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(pcbRef.current);

    return () => resizeObserver.disconnect();
  }, []);


  //get the node x and y position of all 4 points
  function getNodeXY(nodeName: string) {
    const el = document.querySelector(`[data-node="${nodeName}"]`);
    const container = document.querySelector(".pcb");
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
  //returns position closer to core position
  function comparePositions(pos1: number, pos2: number, pos3: number) {
    if (Math.abs(pos3 - pos1) < Math.abs(pos3 - pos2)) {
      return pos1;
    } else {
      return pos2;
    }
  }

  return (
    <section className="tech-stack" ref={ref}>
      <h1
        className="section-title"
        style={inView === true ? { animation: "titleAnim 1s" } : {}}
      >
        Tech Stack
      </h1>
      <div className="pcb" ref={pcbRef}>
        <ul className="pcb-components">
          {techStack.map((comp, idx) => (
            <ul
              key={idx}
              className={`pcb-component`}
            >
              {comp.stack.map((node, idy) => (
                <ul key={idy} className={`nodes ${node.nodeName.toLowerCase()}`}>
                  <li className={node.type} data-node={node.nodeName}>
                    <img src={require(`../../images/techStack/${node.svgName}.svg`)} alt={node.nodeName} />
                    <span>{node.nodeName}</span>
                  </li>
                  {node.subnodes.map((subnode, idz) => (
                    <li
                      key={idz}
                      className={`${subnode.type} ${subnode.nodeName.toLowerCase()}`}
                      data-node={subnode.nodeName}
                    >
                      <img src={require(`../../images/techStack/${subnode.svgName}.svg`)} alt={node.nodeName} />
                      <span>{subnode.nodeName}</span>
                    </li>
                  ))}
                </ul>
              ))}
              <li className={`pcb-section`} data-node={comp.section}>{comp.section}</li>
            </ul>
          ))}
        </ul>
        <div className="paths">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            {techStack.map((comp, idx) => {
              const compXY = getNodeXY(comp.section);
              if (!compXY) return null;
              return (
                <>
                  <path
                    key={`core-section path ${idx}`}
                    d={`
                    M ${corePos[idx].x} ${corePos[idx].y}
                    L ${compXY.bottomMiddle.x} ${corePos[idx].y}
                    L ${compXY.bottomMiddle.x} ${comparePositions(compXY.topMiddle.y, compXY.bottomMiddle.y, corePos[idx].y)}`}
                    strokeWidth="4"
                  />
                  {comp.stack
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((node, idy, sorted) => {
                      const nodeXY = getNodeXY(node.nodeName);
                      if (!nodeXY) return null;

                      const n = sorted.length;
                      const gap = 4;
                      const offset = (idy - (n - 1) / 2) * gap;
                      let offsetY;
                      if (idy % 3 === 0) {
                        triggerPathsSwitch = !triggerPathsSwitch
                      }
                      if (triggerPathsSwitch) {
                        offsetY = - 10 - (idy - (n - gap) / 2) * gap
                      } else {
                        offsetY = - 10 + (idy - (n + gap) / 2) * gap
                      }
                      return (
                        <>
                          <path
                            className={`path ${node.nodeName}`}
                            key={`section-mainnode path ${idy}`}
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
                          {node.subnodes && node.subnodes.map((subnode, idz) => {
                            const subNodeXY = getNodeXY(subnode.nodeName);
                            if (!subNodeXY) return null;
                            return (
                              <path
                                className={`path ${subnode.nodeName}`}
                                key={`section-subnode path ${idz}`}
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
                        </>
                      );
                    })}
                </>
              )
            })}
          </svg>
        </div>
        <div className="core"><LogoSvg /></div>
      </div>
    </section >
  );
}
