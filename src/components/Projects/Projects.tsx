import search from "../../images/search.webp";
import datajs from "../../data/projects/data.json";
import clearSearch from "../../images/clear.webp";
import { filterList } from "../../data/projects/filters";
import "./projects.scss";
import { colors } from "../functions&Variables/colors";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
// here is some important magic done aswell
export default function Projects() {
  //this uses the react-intersection-observer package
  //to make animations when the section is visible to user for the first time
  //this fragment of code is applied in most of components but with different animations

  //DOM elements
  const ProjectItems = document.querySelector(
    ".projects-list-menu-items"
  ) as HTMLDivElement;
  const searchInput = document.querySelector(
    ".search-input"
  ) as HTMLInputElement;
  //I could code this just using javascript intersector observer but this is way simpler and faster
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  //The projects section have search bar and filters
  const [currentFilter, setCurrentFilter] = useState<string>("all"); //to determine which filter is active
  const [currentSearch, setCurrentSearch] = useState<string>(""); //to store the searched phrase from user
  const [isClearVis, setIsClearVis] = useState<boolean>(false);
  //in searching bar inside input field is clear button img
  //this state determines when the clear button should appear

  //this code will scroll the projects list to top and to left in case the mobile breakpoint is active
  //this function exists because when we scroll a little bit and then change the filter or searched phrase
  //the items will render properly but the scroll position would be the same ex. in the middle of projects list
  function fixProjects() {
    if (ProjectItems) {
      ProjectItems.scrollLeft = 0;
      ProjectItems.scrollTop = 0;
    }
  }

  function searchProjects() {
    //here is search mechanism. yeah... It might look complicated and stupid

    //I refactored it a little bit while transfer whole project to typescript
    //now it should be more readable

    //props for function below
    interface Props {
      id: number;
      imgName: string;
      name: string;
      previewURL: string;
      githubURL?: string;
      createdIn: string;
      firstProject?: boolean;
      notWorking?: boolean;
      commercial?: boolean;
    }
    function returnItem(props: Props) {
      return (
        <div className="list-item" key={props.id}>
          {/*the require is there because the images arent in public folder*/}
          <img
            src={require(`../../data/projects/images/${props.imgName}`)}
            alt="projectimage"
            className="item-image"
          />
          <div className="item-name">
            {props.name}
            {props.firstProject && <sup>1st Project!</sup>}
          </div>
          <div
            className="item-buttons"
            style={
              props.createdIn === "commercial"
                ? { justifyContent: "center" }
                : {}
            }
          >
            {props.notWorking === true ? (
              <div className="noPreview">
                <s>Preview</s>
              </div>
            ) : (
              <a href={props.previewURL} target="_blank" rel="noreferrer">
                <div className="preview">Preview</div>
              </a>
            )}
            {props.githubURL && (
              <a href={props.githubURL} target="_blank" rel="noreferrer">
                <div className="checkOnGithub">Check on Github</div>
              </a>
            )}
          </div>
        </div>
      );
    }
    switch (currentFilter) {
      //first code will run switch and decide what filter is applied
      //(only one filter at the time can be applied)
      //then we return JSX item that revieves data from datajs file in data folder
      //the code works automaticly and deleting or adding data wont break it

      //there are some conditions applied for example if the project have preview or github repo
      //or is the project was my first one
      case "all":
        return datajs.map((item) => {
          if (currentSearch === "") {
            //the searching bar is empty
            return returnItem({
              id: item.id,
              imgName: item.imgName,
              name: item.name,
              previewURL: item.previewURL,
              githubURL: item.githubURL,
              createdIn: item.createdIn,
              firstProject: item.firstProject,
              notWorking: item.notWorking,
              commercial: item.commercial,
            });
          } else if (
            item.name.toLowerCase().includes(currentSearch.toLowerCase()) ===
            true
          ) {
            //the searching bar have value and we check if that value is contained in project name
            //both the name and search phrase are loweredCase to prevent the capital letters differences
            return returnItem({
              id: item.id,
              imgName: item.imgName,
              name: item.name,
              previewURL: item.previewURL,
              githubURL: item.githubURL,
              createdIn: item.createdIn,
              firstProject: item.firstProject,
              notWorking: item.notWorking,
              commercial: item.commercial,
            });
          } else {
            return null;
            //Array.prototype.map() expects a return value from arrow function  array-callback-return
            //to prevent this error above when the code cant find item it will return null
          }
        });
      default:
        return datajs.map((item) => {
          if (currentSearch === "") {
            //same as before
            if (currentFilter === item.createdIn) {
              //but now we check if the item match the filter applied
              //so if we want more filters in the page ex. next.js, vue, angular there is no need to change this code
              return returnItem({
                id: item.id,
                imgName: item.imgName,
                name: item.name,
                previewURL: item.previewURL,
                githubURL: item.githubURL,
                createdIn: item.createdIn,
                firstProject: item.firstProject,
                notWorking: item.notWorking,
                commercial: item.commercial,
              });
            } else {
              return null;
            }
          } else if (
            item.name.toLowerCase().includes(currentSearch.toLowerCase()) ===
            true
          ) {
            if (currentFilter === item.createdIn) {
              return returnItem({
                id: item.id,
                imgName: item.imgName,
                name: item.name,
                previewURL: item.previewURL,
                githubURL: item.githubURL,
                createdIn: item.createdIn,
                firstProject: item.firstProject,
                notWorking: item.notWorking,
                commercial: item.commercial,
              });
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
                    if (searchInput.value !== "")
                      setCurrentSearch(searchInput.value);
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
                      searchInput.value = "";
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
                if (searchInput.value !== "")
                  setCurrentSearch(searchInput.value);
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
            {filterList.map((filter) => {
              return (
                <li
                  key={filter}
                  className="projects-list-btn"
                  //little bit of styling when filter is avtive
                  style={
                    currentFilter === filter
                      ? { backgroundColor: colors.pink, color: colors.darkGray }
                      : {}
                  }
                  onClick={() => {
                    setCurrentFilter(filter);
                    fixProjects(); //scrolling top and left
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </li>
              );
            })}
          </ul>
        </div>
        {/*projects list*/}
        {inView && (
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
        )}
      </div>
    </section>
  );
}
