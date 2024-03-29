import logo from "../../images/logo/logo2.webp";
import linkedin from "../../images/socials/linkedin.webp";
import github from "../../images/socials/github.webp";
import fiverr from "../../images/socials/fiverr.webp";
import hadleScroll from "../functions&Variables/handleScroll";
import socials from "../functions&Variables/socials";
import hamburger from "../../images/hamburger.webp";
import MobileNavbar from "../MobileNavbar/MobileNavbar";
//colors from _colors.scss root to manipulate
import { colors } from "../functions&Variables/colors";

import React, { useState } from "react";
import "./navbar.scss";
//here is some important magic done
export default function Navbar() {
  //to determine which section is active
  const [currentSection, setCurrentSection] = useState<string>("home");
  //to check if page is scrolled to top
  const [Ypos, setYPos] = useState<boolean>(true);
  //(only on mobile devices) to determine when mobile navbar should appear
  const [mobileActive, setMobileActive] = useState<boolean>(false);

  document.addEventListener("scroll", () => {
    //object with sections
    const sectionsOffsets = {
      minusNavbar:
        (document.querySelector(".navbar") as HTMLDivElement).offsetHeight * 2,
      projects: (document.querySelector(".projects") as HTMLDivElement)
        .offsetTop,
      technologies: (document.querySelector(".technologies") as HTMLDivElement)
        .offsetTop,
      contact: (document.querySelector(".contact") as HTMLDivElement).offsetTop,
      about: (document.querySelector(".about") as HTMLDivElement).offsetTop,
    };
    //the specific sections on navbar will change color to purple based on user position on page
    if (window.pageYOffset === 0) {
      //check if user scrolled the page
      //if true the user didnt scrolled and navbar changes background to transparent
      setYPos(true);
    } else {
      //else navbar background changes to dark color
      setYPos(false);
      //then we determine where is the user on the page
    }
    //Notice that we substrack the height of navbar times 2 from sections to make changing navigation btns color properly and have better appearance
    if (
      window.pageYOffset >= 0 &&
      window.pageYOffset <
        sectionsOffsets.projects - sectionsOffsets.minusNavbar
    ) {
      setCurrentSection("home");
    } else if (
      window.pageYOffset >=
        sectionsOffsets.projects - sectionsOffsets.minusNavbar &&
      window.pageYOffset <
        sectionsOffsets.technologies - sectionsOffsets.minusNavbar
    ) {
      setCurrentSection("projects");
    } else if (
      window.pageYOffset >=
        sectionsOffsets.technologies - sectionsOffsets.minusNavbar &&
      window.pageYOffset < sectionsOffsets.contact - sectionsOffsets.minusNavbar
    ) {
      setCurrentSection("technologies");
    } else if (
      window.pageYOffset >=
        sectionsOffsets.contact - sectionsOffsets.minusNavbar &&
      window.pageYOffset < sectionsOffsets.about - sectionsOffsets.minusNavbar
    ) {
      setCurrentSection("contact");
    } else {
      setCurrentSection("about");
    }
  });
  //this whole resize event is there because there was a little bug. Let me explain:
  //the user clicked the hamburger on page to make Mobile Navbar active then he resized the page
  //to hit the regular navbar breakpoint so the hamburger disappeard as well as the mobile navbar
  //but the code would still think that the mobile navbar
  //is active and when it is active, user cant scroll the page

  //so here is the solution to solve this
  window.onresize = () => {
    if (window.innerWidth > 1024) {
      //this checks if after resize the width of page hits the breakpoint
      setMobileActive(false); //and if hits, set mobileNavbar state to false
    }
  };
  //and here is this scrolling prevention logic
  if (mobileActive) {
    (document.querySelector("html") as HTMLElement).style.overflowY = "hidden";
  } else {
    (document.querySelector("html") as HTMLElement).style.overflowY = "visible";
  }
  return (
    <>
      <nav
        className="navbar"
        //the purple color change that i mentioned before. It is applied for every menu list item aswell
        style={
          Ypos === true
            ? { background: "transparent" }
            : { background: colors.dark }
        }
      >
        <div className="inner-navbar">
          <img
            src={logo}
            alt="navlogo"
            className="navbar-logo"
            style={
              currentSection === "home"
                ? {
                    filter: `drop-shadow(0px 0px 6px ${colors.purple}) 
                    drop-shadow(0px 0px 6px ${colors.purple})`,
                  }
                : {}
            }
            onClick={() => {
              //our logo works as home button so it is scrolling user to the top of the page
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          />
          <img
            src={hamburger}
            alt="hamburger"
            className="hamburger"
            onClick={() => {
              //when hamburger clicked we acitvate mobile navbar
              setMobileActive(true);
            }}
          />
          <ul className="navbar-menu">
            <li
              //check handleScroll.js in functions folder
              onClick={() => hadleScroll(".projects")}
              style={
                currentSection === "projects" ? { color: colors.purple } : {}
              }
            >
              Projects
            </li>
            <li
              onClick={() => hadleScroll(".technologies")}
              style={
                currentSection === "technologies"
                  ? { color: colors.purple }
                  : {}
              }
            >
              Technologies
            </li>
            <li
              onClick={() => hadleScroll(".contact")}
              style={
                currentSection === "contact" ? { color: colors.purple } : {}
              }
            >
              Contact
            </li>
            <li
              onClick={() => hadleScroll(".about")}
              style={currentSection === "about" ? { color: colors.purple } : {}}
            >
              About
            </li>
          </ul>
          <div className="navbar-socials">
            <a
              className="social-aTag"
              href={socials("linkedin")}
              target="blank"
            >
              <img src={linkedin} alt="linkedin" />
            </a>
            <a className="social-aTag" href={socials("github")} target="blank">
              <img src={github} alt="github" />
            </a>
            <a className="social-aTag" href={socials("fiverr")} target="blank">
              <img src={fiverr} alt="fiverr" />
            </a>
          </div>
        </div>
      </nav>
      {/*
        if we clicked hamburger the mobile navbar is rendered
        there is one props pass I believe to make things work
        */}
      {mobileActive && (
        <MobileNavbar
          currentSection={currentSection}
          setMobileActive={setMobileActive}
        />
      )}
    </>
  );
}
