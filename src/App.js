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
  document.body.style.overflow="hidden"
  useEffect(()=>{
    setTimeout(()=>{
      document.body.style.overflow="visible"
      document.querySelector(".loading-screen").style.animation="loadingAnim2 1s"
      setTimeout(()=>{
        document.querySelector(".loading-screen").style.opacity="0"
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
