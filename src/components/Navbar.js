import placeholder from "../images/logo/placeholder.png"
import linkedin from "../images/socials/linkedin.png"
import github from "../images/socials/github.png"
import fiverr from "../images/socials/fiverr.png"
import hadleScroll from "./functions/handleScroll"
import socials from "./functions/socials"
import React,{useState} from "react"
export default function Navbar() {
    const [currentSection, setCurrentSection]=useState("home")
    const [Ypos, setYPos]=useState(true)
    document.addEventListener("scroll", ()=>{
        if(window.pageYOffset===0){
            setYPos(true)
        }else{
            setYPos(false)
        }
        if(window.pageYOffset>=0&&
        (window.pageYOffset<document.querySelector(".projects").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)){
            setCurrentSection("home")
        }else if(
        (window.pageYOffset>=document.querySelector(".projects").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)&&
        (window.pageYOffset<document.querySelector(".technologies").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)){
            setCurrentSection("projects")
        }else if(
        (window.pageYOffset>=document.querySelector(".technologies").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)&&
        (window.pageYOffset<document.querySelector(".contact").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)){
            setCurrentSection("technologies")
        }else if(
        (window.pageYOffset>=document.querySelector(".contact").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)&&
        (window.pageYOffset<document.querySelector(".about").offsetTop
        -document.querySelector(".navbar").offsetHeight*2)){
            setCurrentSection("contact")
        }else{
            setCurrentSection("about")
        }
    })
    return (
        <nav 
         className="navbar" 
         style={Ypos===true?{background: "transparent"}:{background: "#010A08"}}
         >
            <div className="inner-navbar">
                <img src={placeholder} alt="navlogo" className="navbar-logo"
                    onClick={()=>{
                        document.body.scrollTop = 0;
                        document.documentElement.scrollTop = 0;
                    }}  
                />
                <ul className="navbar-menu">
                    <li 
                     onClick={()=>hadleScroll(".projects")}
                     style={currentSection==="projects"?{color: "#AD00FF"}:{}}
                    >Projects</li>
                    <li 
                     onClick={()=>hadleScroll(".technologies")}
                     style={currentSection==="technologies"?{color: "#AD00FF"}:{}}
                    >Technologies</li>
                    <li 
                     onClick={()=>hadleScroll(".contact")}
                     style={currentSection==="contact"?{color: "#AD00FF"}:{}}
                    >Contact</li>
                    <li 
                     onClick={()=>hadleScroll(".about")}
                     style={currentSection==="about"?{color: "#AD00FF"}:{}}
                    >About</li>
                </ul>
                <div className="navbar-socials">
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
        </nav>
    )
  }
  