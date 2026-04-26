import "./navbar.scss";
import { ReactComponent as LogoSvg } from "../../images/logo/logo.svg";
import { ReactComponent as HamburgerSvg } from "../../images/hamburger.svg";

import sectionsJSON from "../../data/sections/sections.json"
import HandleSectionScroll from "../Utilities/HandleSectionScroll";
import RenderSocials from "../Utilities/RenderSocials";

import MobileNavbar from "../MobileNavbar/MobileNavbar";

import { useState, useEffect } from "react";

export default function Navbar() {
  // navlinks in render are styled based on this
  const [currentSection, setCurrentSection] = useState<string>("home");
  // logo and navbar are styled based on that
  const [isPageAtTop, setIsPageAtTop] = useState<boolean>(true);

  const [mobileActive, setMobileActive] = useState<boolean>(false);

  // we track the position of scroll on website and sections sizes
  // based on that we set currentSection and check if site is scrolled to top
  useEffect(() => {
    //getting navbar
    const navbar = document.querySelector(".navbar") as HTMLDivElement;
    let navbarHeight: number
    let sectionsOffsets: Record<string, number> = {};

    const computeOffsets = () => {
      //navbar is fixed and it is overlapping content so we subtract its height during calculations
      //for better UX navbar height is multiplied
      navbarHeight = navbar.offsetHeight * 2;
      sectionsOffsets = {};

      sectionsJSON.forEach(link => {
        if (link.sectionName === "home") {
          sectionsOffsets[link.sectionName] = 0;
        } else {
          const linkEl = document.querySelector(
            `.${link.sectionDestination}`
          ) as HTMLDivElement;
          if (linkEl) sectionsOffsets[link.sectionName] = linkEl.offsetTop;
        }
      });
    };
    // compute once initially
    computeOffsets();

    const handleScroll = () => {
      //current scroll position
      const scrollPos = window.pageYOffset;
      //if page is at top we change this state for styling purposes
      setIsPageAtTop(scrollPos === 0);

      //if user scrolled to the very bottom we set last section from array as current one
      if (window.innerHeight + scrollPos >= document.body.scrollHeight) {
        setCurrentSection(sectionsJSON[sectionsJSON.length - 1].sectionName);
        return;
      }
      // we iterating backwards
      for (let i = sectionsJSON.length - 1; i >= 0; i--) {
        const sectionName = sectionsJSON[i].sectionName;
        const offset = sectionsOffsets[sectionName] - navbarHeight;

        //because we check backwards we don't need to check the prev section offset
        if (scrollPos >= offset) {
          setCurrentSection(sectionName);
          break;
        }
      }
    };

    // observe navbar and all sections for size changes
    const ro = new ResizeObserver(() => {
      // immediately update currentSection after layout change
      computeOffsets();
      handleScroll();
    });
    ro.observe(navbar);
    sectionsJSON.forEach(link => {
      const el = document.querySelector(`.${link.sectionDestination}`) as HTMLDivElement;
      if (el) ro.observe(el);
    });
    //add scroll event
    window.addEventListener("scroll", handleScroll);

    //unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <nav
        className={`${isPageAtTop ? "" : "scrolled"} navbar`}
      >
        <div className="inner-navbar">
          <LogoSvg
            className={`navbar-logo ${currentSection === "home" && "active-section"}`}
            alt="logo"
            onClick={() => {
              HandleSectionScroll("home")
            }}
          />
          <HamburgerSvg className="hamburger" alt="hamburger" onClick={() => {
            setMobileActive(true);
          }} />
          <ul className="navbar-menu">
            {sectionsJSON
              .filter(link => link.sectionName !== "home")
              .map((link) => {
                return (
                  <li
                    key={link.sectionName}
                    className={currentSection === link.sectionName ? "active-section" : ""}
                    onClick={() => HandleSectionScroll(link.sectionDestination)}
                  >
                    {link.displayName}
                  </li>
                )
              })}
          </ul>
          <RenderSocials propClass="navbar-socials"/>
        </div>
      </nav>
      {mobileActive && (
        <MobileNavbar
          currentSection={currentSection}
          mobileActive={mobileActive}
          setMobileActive={setMobileActive}
        />
      )}
    </>
  );
}
