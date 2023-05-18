import linkedin from "../images/socials/linkedin.png"
import github from "../images/socials/github.png"
import fiverr from "../images/socials/fiverr.png"
import socials from "./functions/socials"
import hadleScroll from "./functions/handleScroll"
export default function Footer() {
    return (
        <footer>
            <div className="inner-footer">
                <div className="copyright">Copyright © <span>Kamilas</span></div>
                <ul className="footer-menu">
                    <li onClick={()=>hadleScroll(".projects")}>Projects</li>
                    <li onClick={()=>hadleScroll(".technologies")}>Technologies</li>
                    <li onClick={()=>hadleScroll(".contact")}>Contact</li>
                    <li onClick={()=>hadleScroll(".about")}>About</li>
                </ul>
                <div className="footer-socials">
                    <img src={linkedin} alt="linkedin" onClick={()=>socials("linkedin")}/>
                    <img src={github} alt="github" onClick={()=>socials("github")}/>
                    <img src={fiverr} alt="fiverr" onClick={()=>socials("fiverr")}/>
                </div>
            </div>
        </footer>
    )
  }