import linkedin from "../images/socials/linkedin.png"
import github from "../images/socials/github.png"
import fiverr from "../images/socials/fiverr.png"
import socials from "./functions/socials"
import React,{useState} from "react"
export default function Contact() {
    const [focusInput, setFocusInput]=useState(null)
    function handleClick(){
        setFocusInput(null)
        document.removeEventListener("click",handleClick, true)
    }
    return (
        <section className="contact">
            <h1 className="section-title">Get in touch</h1>
            <form className="contact-form">
                <div className="contact-inputs">
                    <div className="name">
                        <div><label>Name</label></div>
                        <div className="input-wrap" 
                        style={focusInput==="name"?{background:"linear-gradient(135deg, #FF0099 0%, #AD00FF 100%)"}:{}}>
                            <div className="input">
                                <input
                                    id="formName" 
                                    placeholder="John" 
                                    required
                                    onFocus={()=>{
                                        setFocusInput("name")    
                                    }}
                                    onMouseEnter={()=>document.removeEventListener("click",handleClick, true)}
                                    onMouseLeave={()=>document.addEventListener("click",handleClick, true)}
                                    />
                            </div>
                        </div>
                    </div>
                    <div className="email">
                        <div><label>Email</label></div>
                        <div className="input-wrap"
                        style={focusInput==="email"?{background:"linear-gradient(135deg, #FF0099 0%, #AD00FF 100%)"}:{}}>
                            <div className="input">
                                <input 
                                id="formMail" 
                                placeholder="someone@example.com" required
                                onFocus={()=>setFocusInput("email")}
                                onMouseEnter={()=>document.removeEventListener("click",handleClick, true)}
                                onMouseLeave={()=>document.addEventListener("click",handleClick, true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="textarea-wrap"
                style={focusInput==="comment"?{background:"linear-gradient(135deg, #FF0099 0%, #AD00FF 100%)"}:{}}>
                    <div className="textarea">
                        <textarea 
                         id="comment"
                         placeholder="Your comment" 
                         required onFocus={()=>setFocusInput("comment")}
                         onMouseEnter={()=>document.removeEventListener("click",handleClick, true)}
                         onMouseLeave={()=>document.addEventListener("click",handleClick, true)}
                         />
                    </div>
                </div>
                <div className="contact-buttons">
                    <button 
                        className="contact-submit"
                        onClick={(event)=>{
                            event.preventDefault();
                        }}
                    >Submit</button>
                    <div className="contact-socials">
                        <img src={linkedin} alt="linkedin" onClick={()=>socials("linkedin")}/>
                        <img src={github} alt="github" onClick={()=>socials("github")}/>
                        <img src={fiverr} alt="fiverr" onClick={()=>socials("fiverr")}/>
                    </div>
                </div>
            </form>
        </section>
    )
  }