import linkedin from "../images/socials/linkedin.png"
import github from "../images/socials/github.png"
import fiverr from "../images/socials/fiverr.png"
import socials from "./functions/socials"
import hadleScroll from "./functions/handleScroll"

import { useInView } from 'react-intersection-observer';
export default function Footer() {
    const {ref, inView}=useInView({
        triggerOnce: true
    })
    return (
        <footer ref={ref} style={inView===true?{animation:"footerAnim 0.5s"}:{}}>
            <div className="inner-footer">
                <div className="copyright">Copyright © <span>Kamilas</span></div>
                <ul className="footer-menu">
                    <li onClick={()=>hadleScroll(".projects")}>Projects</li>
                    <li onClick={()=>hadleScroll(".technologies")}>Technologies</li>
                    <li onClick={()=>hadleScroll(".contact")}>Contact</li>
                    <li onClick={()=>hadleScroll(".about")}>About</li>
                </ul>
                <div className="footer-socials">
                    <a className="social-aTag" href={socials("linkedin")} target="blank">
                        <img src={linkedin} alt="linkedin"/>
                    </a>
                    <a className="social-aTag" href={socials("github")} target="blank">
                        <img src={github} alt="github"/>
                    </a>
                    <a className="social-aTag" href={socials("fiverr")} target="blank">
                        <img src={fiverr} alt="fiverr"/>
                    </a>
                </div>
            </div>
        </footer>
    )
  }