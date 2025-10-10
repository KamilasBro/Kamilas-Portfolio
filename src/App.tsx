import logo from "../src/images/logo/logo.webp";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import TechStack from "./components/TechStack/TechStack";
import Contact from "./components/Contact/Contact";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";

import React, { useEffect } from "react";
export default function App() {
  useEffect(() => {
    const htmlEle = document.querySelector("html") as HTMLElement;
    const loadingScreen = document.querySelector(".loading-screen") as HTMLDivElement;
    if (!htmlEle || !loadingScreen) return;

    htmlEle.style.overflowY = "hidden";

    // finish sequence (unblock scroll + play hide animation + remove)
    const finish = () => {
      // allow scroll
      htmlEle.style.overflowY = "visible";
      // play hide animation then remove from flow
      loadingScreen.style.animation = "loadingAnim2 1.2s";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 1000);
    };
    // try to get body's background-image url and preload it
    const bg = getComputedStyle(document.body).backgroundImage || "";
    const match = bg.match(/url\(["']?(.*?)["']?\)/);
    // safety fallback in case load never fires
    const fallbackTimeout = window.setTimeout(finish, 6000);

    if (match && match[1]) {
      const img = new Image();
      img.onload = () => {
        clearTimeout(fallbackTimeout);
        finish();
      };
      img.onerror = () => {
        clearTimeout(fallbackTimeout);
        finish();
      };
      // start loading (if cached, onload should fire)
      img.src = match[1];
    } else {
      // no background image — hide immediately (still allow a tiny display)
      clearTimeout(fallbackTimeout);
      // small delay to allow initial paint
      setTimeout(finish, 250);
    }

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);
  return (
    <>
      <div className="loading-screen">
        <img src={logo} alt="loader" />
      </div>
      <Navbar />
      <main>
        <section className="inner-main">
          <Home />
          <hr />
          <Projects />
          <hr />
          <TechStack />
          <hr />
          <Contact />
          <hr />
          <About />
        </section>
      </main>
      <Footer />
    </>
  );
}
