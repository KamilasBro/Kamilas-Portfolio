import "./footer.scss";

import sectionsJSON from "../../data/sections/sections.json"
import RenderSocials from "../Utilities/RenderSocials";
import HandleSectionScroll from "../Utilities/HandleSectionScroll";

export default function Footer() {
  return (
    <footer>
      <div className="inner-footer">
        <div className="copyright">
          Copyright © <span>Kamilas</span>
        </div>
        <ul className="footer-menu">
          {sectionsJSON
            .filter(link => link.sectionName !== "home")
            .map((link) => {
              return (
                <li
                  key={link.sectionName}
                  onClick={() => HandleSectionScroll(link.sectionDestination)}
                >
                  {link.displayName}
                </li>
              )
            })}
        </ul>
        <RenderSocials propClass="footer-socials" />
      </div>
    </footer >
  );
}
