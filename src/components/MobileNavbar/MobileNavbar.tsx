import { ReactComponent as LogoSvg } from "../../images/logo/logo.svg";
import { ReactComponent as CloseSvg } from "../../images/close.svg";
import hadleSectionScroll from "../Utilities/HadleSectionScroll";
import RenderSocials from "../Utilities/RenderSocials";
import navLinks from "../Utilities/NavLinks";
import React, { useState } from "react";
import "./mobilenavbar.scss";
interface Props {
  currentSection: string;
  setMobileActive: (active: boolean) => void;
}
export default function MobileNavbar(props: Props) {
  const [isClosing, setIsClosing] = useState(false);

  return (
    <section
      className={`mobile-navbar ${isClosing ? "closing" : ""}`}
      onAnimationEnd={(e) => {
        if (isClosing && e.target === e.currentTarget) {
          props.setMobileActive(false);
        }
      }}
    >
      <div className="mobile-navbar-buttons">
        <LogoSvg
          alt="logo"
          className={`mobile-logo ${props.currentSection === "home" && "active-section"}`}
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
        {navLinks.map((link) =>
          <li
            key={link.sectionName}
            className={props.currentSection === link.sectionName ? "active-section" : ""}
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
        )}
      </ul>
      <div className="socials mobile-navbar-socials">
        <RenderSocials />
      </div>
      <hr />
    </section>
  );
}
