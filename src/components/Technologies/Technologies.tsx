import skills from "../../data/technologies/skills.json";
//the skills list is imported from data file
import React, { useState } from "react";
import "./technologies.scss";
import { useInView } from "react-intersection-observer";
export default function Technologies() {
  const { ref, inView } = useInView({
    //see projects.js for explanation
    triggerOnce: true,
  });
  //to determine which technology skills should be displayed
  const [currentTech, setCurrentTech] = useState<string>("html");
  //the data for currentTech
  const currentTechData = skills.find((skill) => skill.name === currentTech);

  return (
    <section className="technologies" ref={ref}>
      <h1
        className="section-title"
        style={inView === true ? { animation: "titleAnim 1s" } : {}}
      >
        Tech Stack
      </h1>
      {/*technologies buttons*/}
      <ul className="technologies-menu">
        {skills.map((skill, index) => {
          return (
            <li
              key={skill.id}
              style={
                inView === true
                  ? { animation: `techAnim1 ${1000 + index * 100}ms` }
                  : {}
              }
            >
              <img
                src={require(`../../images/technologies/${skill.imgName}`)}
                alt={skill.name}
                className="technologies-button"
                style={
                  currentTech === skill.name
                    ? { filter: "grayscale(0%)" }
                    : { filter: "grayscale(100%)" }
                }
                onClick={() => setCurrentTech(skill.name)}
              />
            </li>
          );
        })}
      </ul>
      {/*
            the data from data folder is mapped to return 
            skills and visual lenght of the bar
            */}
      {currentTechData !== undefined &&
        currentTechData.properties.map((ele, index) => {
          return (
            <div
              className="technologies-chart"
              key={index}
              style={
                inView === true
                  ? { animation: `titleAnim ${1000 + index * 100}ms` }
                  : {}
              }
            >
              <div className="chart-text">
                <span className="chart-property">{ele.property}</span>
                <span className="chart-precentage">{ele.precentage}%</span>
              </div>
              <div className="chart-bar">
                <div
                  className="chart-inner-bar"
                  style={{
                    background: currentTechData.background,
                    boxShadow: currentTechData.boxshadow,
                    width: `${ele.precentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
    </section>
  );
}
