import logo from "../images/logo/logo.png"
import closeNavbar from "../images/closeNavbar.png"
import linkedin from "../images/socials/linkedin.png"
import github from "../images/socials/github.png"
import fiverr from "../images/socials/fiverr.png"

import hadleScroll from "./functions/handleScroll"
import socials from "./functions/socials"

//this works the same as navbar but with one addition
export default function MobileNavbar(props){
    function close(){//this function will trigger the closing animation for mobile navbar
        document.querySelector(".mobile-navbar").style.transform="translateX(-100%)"
        setTimeout(()=>{props.setMobileActive(false)},500)//and close it after 0.5s
    }
    return(
        <section className="mobile-navbar">
            <div className="mobile-navbar-buttons">
                <img src={logo} alt="logo" className="mobile-logo"/>
                <img src={closeNavbar} alt="closeNavbar" className="close-navbar"
                    onClick={()=>{
                        close()
                    }}
                />
            </div>
            <ul className="mobile-navbar-menu">
                <li 
                     onClick={()=>{
                        document.body.scrollTop = 0;
                        document.documentElement.scrollTop = 0;
                        close()
                    }}  
                     style={props.currentSection==="home"?{color: "#AD00FF"}:{}}
                    >Home</li>
                <li 
                     onClick={()=>{
                        hadleScroll(".projects")
                        close()
                    }}
                     style={props.currentSection==="projects"?{color: "#AD00FF"}:{}}
                    >Projects</li>
                    <li 
                     onClick={()=>{
                        hadleScroll(".technologies")
                        close()
                    }}
                     style={props.currentSection==="technologies"?{color: "#AD00FF"}:{}}
                    >Technologies</li>
                    <li 
                     onClick={()=>{
                        hadleScroll(".contact")
                        close()
                    }}
                     style={props.currentSection==="contact"?{color: "#AD00FF"}:{}}
                    >Contact</li>
                    <li 
                     onClick={()=>{
                        hadleScroll(".about")
                        close()
                    }}
                     style={props.currentSection==="about"?{color: "#AD00FF"}:{}}
                    >About</li>
            </ul>
            <div className="mobile-navbar-socials">
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
            <hr style={{marginTop: "40px"}}/>
        </section>
    )
}