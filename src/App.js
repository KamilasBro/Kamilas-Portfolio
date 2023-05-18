import arrow from "./images/arrow.png"
import hadleScroll from "./components/functions/handleScroll";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Technologies from "./components/Technologies";
import OtherTechnologies from "./components/OtherTechnologies";
import Contact from "./components/Contact";
import About from "./components/About";
import Footer from "./components/Footer";
export default function App() {
  return (
    <>
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
