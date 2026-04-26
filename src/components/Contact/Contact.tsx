import "./contact.scss";
import { ReactComponent as MailSendingSvg } from "../../images/contact/mailSending.svg";
import { ReactComponent as MailSuccessSvg } from "../../images/contact/mailSuccess.svg";
import { ReactComponent as MailFailSvg } from "../../images/contact/mailFail.svg";

import React, { useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import RenderSocials from "../Utilities/RenderSocials";
import EncryptText from "../Utilities/DecryptText";

export default function Contact() {

  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  // class for styling on view
  const notInViewClass = !inView ? "not-in-view" : "";

  // Form status state: controls submission status and feedback
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  // Countdown state and ref for auto-refresh of form after submission
  const [counter, setCounter] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  //website is hosted on netlifyy
  //according to netlify custom form handler should look like this
  //more details below
  //https://www.netlify.com/blog/2017/07/20/how-to-integrate-netlifys-form-handling-in-a-react-app/

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    const body = new URLSearchParams({
      "form-name": "contact",
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (response.ok) {
        setFormStatus("success");

      } else {
        setFormStatus("error");
      }
    } catch (error) {
      setFormStatus("error");
    }
    startCountdown(5);
  };

  const startCountdown = (seconds: number) => {
    setCounter(seconds);

    timerRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev === null || prev <= 1) {
          clearCountdown();
          handleRefresh();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Manually reset the form status and clear timer
  const handleRefresh = () => {
    clearCountdown();
    setFormStatus("idle");
  };

  const clearCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCounter(null);
  };

  return (
    <section className="contact" ref={ref}>
      <EncryptText
        text="Get in touch"
        HTMLtag="h1"
        encryptInView={inView}
        className="section-title"
      />
      <div className="form-wrap">
        <form
          className="contact-form"
          name="contact"
          method="POST"
          data-netlify="true"             // enable Netlify form handling
          data-netlify-honeypot="bot-field" // hidden field to prevent spam bots
          onSubmit={handleSubmit}         // handle submission via JS
        >
          {/* hidden fields required by Netlify */}
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="bot-field" />

          <div className={`form-field name ${notInViewClass}`}>
            <EncryptText
              text="Name"
              HTMLtag="label"
              encryptInView={inView}
              className="name-label"
              iterationsRange={5}
            />
            <div className="input-wrap">
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="John"
                disabled={formStatus !== "idle"}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                value={formData.name}
              />
            </div>
          </div>
          <div className={`form-field email ${notInViewClass}`}>
            <EncryptText
              text="Email"
              HTMLtag="label"
              encryptInView={inView}
              className="email-label"
              iterationsRange={5}
            />
            <div className="input-wrap">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="someone@example.com"
                disabled={formStatus !== "idle"}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                value={formData.email}
              />
            </div>
          </div>
          <div className={`input-wrap message ${notInViewClass}`}>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Your message"
              disabled={formStatus !== "idle"}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              value={formData.message}
            />
          </div>
          <div className="buttons-wrap">
            <div className={`submit-wrap ${notInViewClass}`}>
              <button type="submit" className="submit-btn" disabled={formStatus !== "idle"}>
                Submit
              </button>
            </div>
            <RenderSocials propClass={`contact-socials ${notInViewClass}`} />
          </div>
        </form>
        {/* Form submission feedback */}
        {
          formStatus !== "idle" && (
            <div className="form-status-wrap">
              <div className={`form-status form-status-${formStatus}`}>
                {/* Icon and text depending on current status */}
                {formStatus === "submitting" && <>
                  <MailSendingSvg />
                  <p>Submitting</p>
                </>}
                {formStatus === "success" && <>
                  <MailSuccessSvg />
                  <p>Success!</p>
                </>}
                {formStatus === "error" && <>
                  <MailFailSvg />
                  <p>Ooops!</p>
                </>}
              </div>

              {/* Additional error information */}
              {formStatus === "error" && (
                <p className="form-error-info">Something went wrong, please try again.</p>
              )}

              {/* Countdown for auto-refresh and manual refresh button */}
              {(formStatus === "error" || formStatus === "success") && (
                <div className="form-refresh">
                  <p>Form refreshes in <span>{counter}</span></p>
                  <div className="refresh-btn-wrap">
                    <button className="refresh-btn" onClick={handleRefresh}>Refresh now</button>
                  </div>
                </div>
              )}
            </div>
          )
        }
      </div >
    </section >
  );
}
