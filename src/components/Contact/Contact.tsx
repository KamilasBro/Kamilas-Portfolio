import linkedin from "../../images/socials/linkedin.webp";
import github from "../../images/socials/github.webp";
import fiverr from "../../images/socials/fiverr.webp";
// ../../ see about.js for explanation
import socials from "../functions&Variables/socials";
import React, { useState } from "react";
import "./contact.scss";
import { useInView } from "react-intersection-observer";
//colors from _colors.scss root to manipulate
import { colors } from "../functions&Variables/colors";
export default function Contact() {
  const { ref, inView } = useInView({
    //see projects.js for explanation
    triggerOnce: true,
  });
  const [focusInput, setFocusInput] = useState<string>("");
  //to determine which input is now active(i used mask to make radius gradient border)

  function handleClick() {
    // to remove active input after interacting with other page
    setFocusInput("");
    document.removeEventListener("click", handleClick, true);
  }
  return (
    <section className="contact" ref={ref}>
      <h1
        className="section-title"
        style={inView === true ? { animation: "titleAnim 1s" } : {}}
      >
        Get in touch
      </h1>
      <form
        className="contact-form"
        name="contact"
        method="POST"
        data-netlify-honeypot="bot-field"
      >
        <input type="hidden" name="form-name" value="contact" />
        <div hidden>
          <input name="bot-field" />
        </div>
        <div className="contact-inputs">
          <div
            className="name"
            style={inView === true ? { animation: "contactAnim1 1.1s" } : {}}
          >
            <label>Name</label>
            <div
              className="input-wrap"
              style={
                focusInput === "name"
                  ? {
                      background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.purple} 100%)`,
                    }
                  : {}
              }
            >
              <div className="input">
                <input
                  type="text"
                  name="name"
                  placeholder="John"
                  required
                  onFocus={() => {
                    setFocusInput("name");
                  }}
                  //to disable clearing the input if we click on another input
                  onMouseEnter={() =>
                    document.removeEventListener("click", handleClick, true)
                  }
                  onMouseLeave={() =>
                    document.addEventListener("click", handleClick, true)
                  }
                />
              </div>
            </div>
          </div>
          <div
            className="email"
            style={inView === true ? { animation: "contactAnim2 1.1s" } : {}}
          >
            <label>Email</label>
            <div
              className="input-wrap"
              style={
                focusInput === "email"
                  ? {
                      background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.purple} 100%)`,
                    }
                  : {}
              }
            >
              <div className="input">
                <input
                  type="email"
                  name="email"
                  placeholder="someone@example.com"
                  required
                  onFocus={() => setFocusInput("email")}
                  onMouseEnter={() =>
                    document.removeEventListener("click", handleClick, true)
                  }
                  onMouseLeave={() =>
                    document.addEventListener("click", handleClick, true)
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div style={inView === true ? { animation: "contactAnim1 1.2s" } : {}}>
          <div
            className="textarea-wrap"
            style={
              focusInput === "comment"
                ? {
                    background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.purple} 100%)`,
                  }
                : {}
            }
          >
            <div className="textarea">
              <textarea
                name="message"
                placeholder="Your message"
                required
                onFocus={() => setFocusInput("comment")}
                onMouseEnter={() =>
                  document.removeEventListener("click", handleClick, true)
                }
                onMouseLeave={() =>
                  document.addEventListener("click", handleClick, true)
                }
              />
            </div>
          </div>
        </div>
        <div className="contact-buttons">
          <button
            className="contact-submit"
            type="submit"
            style={inView === true ? { animation: "contactAnim1 1.3s" } : {}}
          >
            Submit
          </button>
          {/*same socials as in navbar*/}
          <div
            className="contact-socials"
            style={inView === true ? { animation: "contactAnim2 1.3s" } : {}}
          >
            <a
              className="social-aTag"
              href={socials("linkedin")}
              target="blank"
            >
              <img src={linkedin} alt="linkedin" />
            </a>
            <a className="social-aTag" href={socials("github")} target="blank">
              <img src={github} alt="github" />
            </a>
            <a className="social-aTag" href={socials("fiverr")} target="blank">
              <img src={fiverr} alt="fiverr" />
            </a>
          </div>
        </div>
      </form>
    </section>
  );
}
