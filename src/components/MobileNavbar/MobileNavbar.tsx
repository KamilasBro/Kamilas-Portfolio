import "./mobilenavbar.scss";
import { ReactComponent as LogoSvg } from "../../images/logo/logo.svg";
import { ReactComponent as CloseSvg } from "../../images/close.svg";

import sectionsJSON from "../../data/sections/sections.json"
import hadleSectionScroll from "../Utilities/HandleSectionScroll";
import RenderSocials from "../Utilities/RenderSocials";

import { useState, useEffect } from "react";

interface PropsInterface {
  currentSection: string;
  mobileActive: boolean;
  setMobileActive: (active: boolean) => void;
}

export default function MobileNavbar({
  currentSection,
  mobileActive,
  setMobileActive
}: PropsInterface) {
  const [isClosing, setIsClosing] = useState(false);

  //disable scroll if mobileNavbar is active
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflowY = mobileActive ? "hidden" : "visible";

    return () => {
      html.style.overflowY = "visible";
    };
  }, [mobileActive]);


  //disable mobile navbar if window width is higher than mobile breakpoint
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
  }, [setMobileActive]);

  return (
    <section
      className={`mobile-navbar ${isClosing ? "closing" : ""}`}
      onAnimationEnd={(e) => e.target === e.currentTarget && isClosing && setMobileActive(false)}
    >
      <div className="mobile-navbar-buttons">
        <LogoSvg
          alt="logo"
          className={`mobile-logo ${currentSection === "home" ? "active-section" : ""}`}
          onClick={() => {
            hadleSectionScroll("home")
            setIsClosing(true);
          }}
        />
        <CloseSvg
          alt="closeNavbar"
          className="close-navbar"
          onClick={() => {
            setIsClosing(true);
          }}
        />
      </div>
      <ul className="mobile-navbar-menu">
        {sectionsJSON
          .filter(link => link.sectionName !== "home")
          .map((link) => {
            return (
              <li
                key={link.sectionName}
                className={currentSection === link.sectionName ? "active-section" : ""}
              >
                <span
                  onClick={() => {
                    hadleSectionScroll(link.sectionDestination);
                    setIsClosing(true);
                  }}
                >
                  {link.displayName}
                </span>
              </li>
            )
          })}
      </ul>
      <RenderSocials propClass="mobile-navbar-socials"/>
    </section>
  );
}
