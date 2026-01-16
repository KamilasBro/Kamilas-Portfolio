import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import TechStack from "./components/TechStack/TechStack";
import Contact from "./components/Contact/Contact";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";
import LoadingScreen from "./components/Utilities/LoadingScreen";
import React, { useState } from "react";
export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <>
      {isLoading && <LoadingScreen isLoading={isLoading} setisLoading={setIsLoading} />}
      <Navbar />
      <main>
        {!isLoading && <Home />}
        <hr />
        <Projects />
        <hr />
        <TechStack />
        <hr />
        <Contact />
        <hr />
        <About />
      </main>
      <Footer />
    </>
  );
}
