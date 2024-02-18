import arrow from "./images/arrow.webp";
import hadleScroll from "./components/functions&Variables/handleScroll";
import logo from "../src/images/logo/logo.webp";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import Technologies from "./components/Technologies/Technologies";
import OtherTechnologies from "./components/OtherTechnologies/OtherTechnologies";
import Contact from "./components/Contact/Contact";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";

import React, { useEffect } from "react";
export default function App() {
  //to determine when loading screen should end
  useEffect(() => {
    const htmlEle=document.querySelector("html") as HTMLElement
    const loadingScreen=document.querySelector(".loading-screen") as HTMLDivElement
    htmlEle.style.overflowY = "hidden";
    setTimeout(() => {
      htmlEle.style.overflowY = "visible";
      loadingScreen.style.animation =
        "loadingAnim2 1.2s";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 1000);
    }, 2200);
  }, []);
  //there was no state needed in App itself so no props passed
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
          <div className="arrow-wrap">
            <img
              src={arrow}
              alt="arrow"
              className="arrow"
              onClick={() => hadleScroll(".projects")}
            />
          </div>
          <Projects />
          <hr />
          <Technologies />
          <hr />
          <OtherTechnologies />
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
