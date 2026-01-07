import { ReactComponent as LogoSvg } from "../../images/logo/logo.svg";
import hadleSectionScroll from "../Utilities/hadleSectionScroll";
import RenderSocials from "../Utilities/RenderSocials";

import navLinks from "../Utilities/NavLinks";
import { ReactComponent as HamburgerSvg } from "../../images/hamburger.svg";
import MobileNavbar from "../MobileNavbar/MobileNavbar";

import React, { useState, useEffect } from "react";
import "./navbar.scss";
export default function Navbar() {
  const [currentSection, setCurrentSection] = useState<string>("home");
  const [Ypos, setYPos] = useState<boolean>(true);
  const [mobileActive, setMobileActive] = useState<boolean>(false);

  useEffect(() => {
    const sectionsOffsets = {
      minusNavbar:
        (document.querySelector(".navbar") as HTMLDivElement).offsetHeight * 2,
      projects: (document.querySelector(".projects") as HTMLDivElement)
        .offsetTop,
      techStack: (document.querySelector(".tech-stack") as HTMLDivElement)
        .offsetTop,
      contact: (document.querySelector(".contact") as HTMLDivElement).offsetTop,
      about: (document.querySelector(".about") as HTMLDivElement).offsetTop,
    };
    const handleScroll = () => {
      if (window.pageYOffset === 0) {
        setYPos(true);
      } else {
        setYPos(false);
      }
      if (
        window.pageYOffset >= 0 &&
        window.pageYOffset <
        sectionsOffsets.projects - sectionsOffsets.minusNavbar
      ) {
        setCurrentSection("home");
      }
      else if (
        window.innerHeight + window.pageYOffset >=
        document.documentElement.scrollHeight - 1
      ) {
        setCurrentSection("about");
      }
      else if (
        window.pageYOffset >=
        sectionsOffsets.projects - sectionsOffsets.minusNavbar &&
        window.pageYOffset <
        sectionsOffsets.techStack - sectionsOffsets.minusNavbar
      ) {
        setCurrentSection("projects");
      } else if (
        window.pageYOffset >=
        sectionsOffsets.techStack - sectionsOffsets.minusNavbar &&
        window.pageYOffset < sectionsOffsets.contact - sectionsOffsets.minusNavbar
      ) {
        setCurrentSection("techStack");
      } else if (
        window.pageYOffset >=
        sectionsOffsets.contact - sectionsOffsets.minusNavbar &&
        window.pageYOffset < sectionsOffsets.about - sectionsOffsets.minusNavbar
      ) {
        setCurrentSection("contact");
      } else {
        setCurrentSection("about");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileActive(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);

    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflowY = mobileActive ? "hidden" : "visible";

    return () => {
      html.style.overflowY = "visible";
    };
  }, [mobileActive]);
  return (
    <>
      <nav
        className={`${Ypos ? "" : "scrolled"} navbar`}
      >
        <div className="inner-navbar">
          <LogoSvg
            className={`navbar-logo ${currentSection === "home" && "active-section"}`}
            alt="logo"
            onClick={() => {
              hadleSectionScroll("home")
            }}
          />
          <HamburgerSvg className="hamburger" alt="hamburger" onClick={() => {
            setMobileActive(true);
          }} />
          <ul className="navbar-menu">
            {navLinks.map((link) =>
              <li
                key={link.sectionName}
                className={currentSection === link.sectionName ? "active-section" : ""}
                onClick={() => hadleSectionScroll(link.sectionDestination)}
              >
                {link.displayName}
              </li>
            )}
          </ul>
          <div className="socials navbar-socials">
            <RenderSocials />
          </div>
        </div>
      </nav>
      {mobileActive && (
        <MobileNavbar
          currentSection={currentSection}
          setMobileActive={setMobileActive}
        />
      )}
    </>
  );
}
