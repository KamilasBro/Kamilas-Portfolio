import arrow from "./images/arrow.png"
import hadleScroll from "./components/functions/handleScroll";
import placeholder from "../src/images/logo/placeholder.png"

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Technologies from "./components/Technologies";
import OtherTechnologies from "./components/OtherTechnologies";
import Contact from "./components/Contact";
import About from "./components/About";
import Footer from "./components/Footer";

import React,{useEffect} from "react";
export default function App() {
  
  useEffect(()=>{
    document.querySelector("html").style.overflowY="hidden"
    setTimeout(()=>{
      document.querySelector("html").style.overflowY="visible"
      document.querySelector(".loading-screen").style.animation="loadingAnim2 1.2s"
      setTimeout(()=>{
        document.querySelector(".loading-screen").style.display="none"
      },1000)
    },1000)
  },[])
  return (
    <>
      <div className="loading-screen">
        <img src={placeholder} alt="loader"/>
      </div>
      <Navbar/>
      <main>
        <section className="inner-main">
          <Home/>
          <hr/>
          <div className="arrow-wrap">
            <img src={arrow} alt="arrow" className="arrow"
              onClick={()=>hadleScroll(".projects")}
            />
          </div>
          <Projects/>
          <hr/>
          <Technologies/>
          <hr/>
          <OtherTechnologies/>
          <hr/>
          <Contact/>
          <hr/>
          <About/>
        </section>
      </main>
      <Footer/>
    </>
  )
}
