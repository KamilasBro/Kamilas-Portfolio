import RenderSocials from "../Utilities/RenderSocials";
import React, { useState } from "react";
import "./contact.scss";
import { ReactComponent as MailSendingSvg } from "../../images/contact/mailSending.svg";
import { ReactComponent as MailSuccessSvg } from "../../images/contact/mailSuccess.svg";
import { ReactComponent as MailFailSvg } from "../../images/contact/mailFail.svg";

import { useInView } from "react-intersection-observer";


export default function Contact() {
  const { ref, inView } = useInView({

    triggerOnce: true,
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [counter, setCounter] = useState<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

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
    startTimer(5);
  };

  const startTimer = (seconds: number) => {
    setCounter(seconds);
    timerRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev === null || prev <= 1) {
          clearTimer();
          handleRefresh();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCounter(null);
  };

  const handleRefresh = () => {
    clearTimer();
    setFormStatus("idle");
  };

  return (
    <section className="contact" ref={ref}>
      <h1 className="section-title">Get in touch</h1>
      <div className="form-wrap">
        <form
          className="contact-form"
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          {/* hidden input is require for netlify form handling */}
          <input type="hidden" name="form-name" value="contact" />
          {/* honeypot field for netlify spam protection */}
          <input type="hidden" name="bot-field" />
          <div className="form-field name">
            <label htmlFor="name">Name</label>
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
          <div className="form-field email">
            <label htmlFor="email">Email</label>
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
          <div className="input-wrap message">
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
            <div className="submit-wrap">
              <button type="submit" className="submit-btn" disabled={formStatus !== "idle"}>
                Submit
              </button>
            </div>
            <div className="socials contact-socials">
              <RenderSocials />
            </div>
          </div>
        </form>
        {formStatus !== "idle" && (
          <div className="form-status-wrap">
            <div className={`form-status form-status-${formStatus}`}>
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
            {formStatus === "error" && (
              <p className="form-error-info">Something went wrong, please try again.</p>
            )}
            {(formStatus === "error" || formStatus === "success") && (
              <div className="form-refresh">
                <p>Form refreshes in <span>{counter}</span></p>
                <div className="refresh-btn-wrap">
                  <button className="refresh-btn" onClick={handleRefresh}>Refresh now</button>
                </div>
              </div>
            )}
          </div>)}
      </div>
    </section >
  );
}
