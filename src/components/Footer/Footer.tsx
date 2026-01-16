import hadleSectionScroll from "../Utilities/HadleSectionScroll";
import RenderSocials from "../Utilities/RenderSocials";
import navLinks from "../Utilities/NavLinks";
import "./footer.scss";

export default function Footer() {
  return (
    <footer>
      <div className="inner-footer">
        <div className="copyright">
          Copyright © <span>Kamilas</span>
        </div>
        <ul className="footer-menu">
          {navLinks.map((link) =>
            <li
              key={link.sectionName}
              onClick={() => hadleSectionScroll(link.sectionDestination)}>
              {link.displayName}
            </li>)}
        </ul>
        <div className="socials footer-socials">
          <RenderSocials />
        </div>
      </div>
    </footer>
  );
}
