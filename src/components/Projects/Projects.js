import search from "../../images/search.png";
import datajs from "../../data/projects/data.json";
import clearSearch from "../../images/clear.png";
import "./projects.css";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
// here is some important magic done aswell
export default function Projects() {
  //this uses the react-intersection-observer package
  //to make animations when the section is visible to user for the first time
  //this fragment of code is applied in most of components but with different animations

  //I could code this just using javascript intersector observer but this is way simpler and faster
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  //The projects section have search bar and filters
  const [currentFilter, setCurrentFilter] = useState("all"); //to determine which filter is active
  const [currentSearch, setCurrentSearch] = useState(""); //to store the searched phrase from user
  const [isClearVis, setIsClearVis] = useState(false);
  //in searching bar inside input field is clear button img
  //this state determines when the clear button should appear

  //this code will scroll the projects list to top and to left in case the mobile breakpoint is active
  //this function exists because when we scroll a little bit and then change the filter or searched phrase
  //the items will render properly but the scroll position would be the same ex. in the middle of projects list
  function fixProjects() {
    document.querySelector(".projects-list-menu-items").scrollLeft = 0;
    document.querySelector(".projects-list-menu-items").scrollTop = 0;
  }

  function searchProjects() {
    //here is search mechanism. yeah... It might look complicated and stupid
    //I believe it could be refactored to be smaller but it works perfectly
    //and personally i find this more readable and understandable rather than
    //passing x variables through functions just to make code smaller
    switch (currentFilter) {
      //first code will run switch and decide what filter is applied
      //(only one filter at the time can be applied)
      //then we return JSX item that revieves data from datajs file in data folder
      //the code works automaticly and deleting or adding data wont break it

      //there are some conditions applied for example if the project have preview or github repo
      //or is the project was my first one
      case "all":
        return datajs.map((e) => {
          if (currentSearch === "") {
            //the searching bar is empty
            return (
              <div className="list-item" key={e.id}>
                {/*the require is there because the images arent in public folder*/}
                <img
                  src={require(`../../data/projects/images/${e.imgName}`)}
                  alt="projectimage"
                  className="item-image"
                />
                <div className="item-name">
                  {e.name}
                  {e.firstProject && <sup>1st Project!</sup>}
                </div>
                <div
                  className="item-buttons"
                  style={
                    e.createdIn === "wordpress"
                      ? { justifyContent: "center" }
                      : {}
                  }
                >
                  {e.notWorking === true ? (
                    <div className="noPreview">
                      <s>Preview</s>
                    </div>
                  ) : (
                    <a href={e.previewURL} target="_blank" rel="noreferrer">
                      <div className="preview">Preview</div>
                    </a>
                  )}
                  {e.githubURL && (
                    <a href={e.githubURL} target="_blank" rel="noreferrer">
                      <div className="checkOnGithub">Check on Github</div>
                    </a>
                  )}
                </div>
              </div>
            );
          } else if (
            e.name.toLowerCase().includes(currentSearch.toLowerCase()) === true
          ) {
            //the searching bar have value and we check if that value is contained in project name
            //both the name and search phrase are loweredCase to prevent the capital letters differences
            return (
              <div className="list-item" key={e.id}>
                <img
                  src={require(`../../data/projects/images/${e.imgName}`)}
                  alt="projectimage"
                  className="item-image"
                />
                <div className="item-name">
                  {e.name}
                  {e.firstProject && <sup>1st Project!</sup>}
                </div>
                <div
                  className="item-buttons"
                  style={
                    e.createdIn === "wordpress"
                      ? { justifyContent: "center" }
                      : {}
                  }
                >
                  {e.notWorking === true ? (
                    <div className="noPreview">
                      <s>Preview</s>
                    </div>
                  ) : (
                    <a href={e.previewURL} target="_blank" rel="noreferrer">
                      <div className="preview">Preview</div>
                    </a>
                  )}
                  {e.githubURL && (
                    <a href={e.githubURL} target="_blank" rel="noreferrer">
                      <div className="checkOnGithub">Check on Github</div>
                    </a>
                  )}
                </div>
              </div>
            );
          } else {
            return null;
            //Array.prototype.map() expects a return value from arrow function  array-callback-return
            //to prevent this error above when the code cant find item it will return null
          }
        });
      default:
        return datajs.map((e) => {
          if (currentSearch === "") {
            //same as before
            if (currentFilter === e.createdIn) {
              //but now we check if the item match the filter applied
              //so if we want more filters in the page ex. next.js, vue, angular there is no need to change this code
              return (
                <div className="list-item" key={e.id}>
                  <img
                    src={require(`../../data/projects/images/${e.imgName}`)}
                    alt="projectimage"
                    className="item-image"
                  />
                  <div className="item-name">
                    {e.name}
                    {e.firstProject && <sup>1st Project!</sup>}
                  </div>
                  <div
                    className="item-buttons"
                    style={
                      e.createdIn === "wordpress"
                        ? { justifyContent: "center" }
                        : {}
                    }
                  >
                    {e.notWorking === true ? (
                      <div className="noPreview">
                        <s>Preview</s>
                      </div>
                    ) : (
                      <a href={e.previewURL} target="_blank" rel="noreferrer">
                        <div className="preview">Preview</div>
                      </a>
                    )}
                    {e.githubURL && (
                      <a href={e.githubURL} target="_blank" rel="noreferrer">
                        <div className="checkOnGithub">Check on Github</div>
                      </a>
                    )}
                  </div>
                </div>
              );
            } else {
              return null;
            }
          } else if (
            e.name.toLowerCase().includes(currentSearch.toLowerCase()) === true
          ) {
            if (currentFilter === e.createdIn) {
              return (
                <div className="list-item" key={e.id}>
                  <img
                    src={require(`../../data/projects/images/${e.imgName}`)}
                    alt="projectimage"
                    className="item-image"
                  />
                  <div className="item-name">
                    {e.name}
                    {e.firstProject && <sup>1st Project!</sup>}
                  </div>
                  <div
                    className="item-buttons"
                    style={
                      e.createdIn === "wordpress"
                        ? { justifyContent: "center" }
                        : {}
                    }
                  >
                    {e.notWorking === true ? (
                      <div className="noPreview">
                        <s>Preview</s>
                      </div>
                    ) : (
                      <a href={e.previewURL} target="_blank" rel="noreferrer">
                        <div className="preview">Preview</div>
                      </a>
                    )}
                    {e.githubURL && (
                      <a href={e.githubURL} target="_blank" rel="noreferrer">
                        <div className="checkOnGithub">Check on Github</div>
                      </a>
                    )}
                  </div>
                </div>
              );
            } else {
              return null;
            }
          } else {
            return null;
          }
        });
    }
  }
  return (
    <section className="projects" ref={ref}>
      {/*the intersector thing i mentioned*/}
      <h1
        className="section-title"
        style={inView === true ? { animation: "titleAnim 1s" } : {}}
      >
        Projects
      </h1>
      <div
        className="projects-list"
        style={inView === true ? { animation: "projectsAnim1 2s" } : {}}
      >
        {/*the intersector thing i mentioned*/}
        <div className="projects-list-menu">
          {/*searching bar*/}
          <div
            className="search-bar"
            style={inView === true ? { animation: "projectsAnim2 1s" } : {}}
          >
            <div className="search-input-wrap">
              <input
                className="search-input"
                placeholder="Search"
                onKeyDown={(event) => {
                  //when the enter is clicked and searched value isnt empty string
                  //we change searched phrase state with the value of this input
                  if (event.key === "Enter") {
                    if (document.querySelector(".search-input").value !== "")
                      setCurrentSearch(
                        document.querySelector(".search-input").value
                      );
                  }
                }}
                onChange={(event) => {
                  //this code will decide when clear search btn should be visible
                  //and when we deleting letters one by one the code will know when
                  //input value is empty and will hide clear btn and change searching phrase state
                  if (event.target.value === "") {
                    setIsClearVis(false);
                    setCurrentSearch("");
                  } else {
                    setIsClearVis(true);
                  }
                }}
              />
              {
                //the clear btn conditional render
                isClearVis && (
                  <img
                    src={clearSearch}
                    alt="clearsearch"
                    className="clear-search"
                    onClick={() => {
                      setIsClearVis(false);
                      document.querySelector(".search-input").value = "";
                      setCurrentSearch("");
                    }}
                  />
                )
              }
            </div>
            <div
              className="search-icon-wrap"
              onClick={() => {
                //search btn that will set searched phrase state with this input value
                //as long as the value is not an emmpty string
                if (document.querySelector(".search-input").value !== "")
                  setCurrentSearch(
                    document.querySelector(".search-input").value
                  );
              }}
            >
              <img src={search} alt="search" />
            </div>
          </div>
          {/*filters*/}
          <ul
            className="projects-list-menu-buttons"
            style={inView === true ? { animation: "projectsAnim2 1s" } : {}}
          >
            <li
              className="projects-list-btn"
              //little bit of styling when filter is avtive
              style={
                currentFilter === "all"
                  ? { backgroundColor: "#FF0099", color: "#171717" }
                  : {}
              }
              onClick={() => {
                setCurrentFilter("all");
                fixProjects(); //scrolling top and left
              }}
            >
              All
            </li>
            <li
              className="projects-list-btn"
              style={
                currentFilter === "react"
                  ? { backgroundColor: "#FF0099", color: "#171717" }
                  : {}
              }
              onClick={() => {
                setCurrentFilter("react");
                fixProjects();
              }}
            >
              React
            </li>
            <li
              className="projects-list-btn"
              style={
                currentFilter === "javascript"
                  ? { backgroundColor: "#FF0099", color: "#171717" }
                  : {}
              }
              onClick={() => {
                setCurrentFilter("javascript");
                fixProjects();
              }}
            >
              Javascript
            </li>
            <li
              className="projects-list-btn"
              style={
                currentFilter === "wordpress"
                  ? { backgroundColor: "#FF0099", color: "#171717" }
                  : {}
              }
              onClick={() => {
                setCurrentFilter("wordpress");
                fixProjects();
              }}
            >
              Wordpress
            </li>
          </ul>
        </div>
        {/*projects list*/}
        <div className="projects-list-menu-items">
          {searchProjects() /*this will render projects*/}

          {/*when code will not find any projects it will let user know*/}
          {/*
                    so there is codition that checks the length of array that map returns
                    but if there is no project the map still have the same lenght because of the null returns
                    I metioned in searchProjects function
                    so there is a filter that returns array that will not include all null's
                    and now if the array is empty(lenght equals 0) user will see this indicator
                    */}
          {searchProjects().filter((e) => e != null).length === 0 && (
            <div className="project-not-found">Project not found</div>
          )}
        </div>
      </div>
    </section>
  );
}
