import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import RandomPathCanvas from "./components/BgAnims/RandomPath";
import MatrixText from "./components/BgAnims/MatrixText";

import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import TechStack from "./components/TechStack/TechStack";
import Contact from "./components/Contact/Contact";
import About from "./components/About/About";

import { useState } from "react";
export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [freeze, setFreeze] = useState(false)
  return (
    <>
      {isLoading &&
        <LoadingScreen
          isLoading={isLoading}
          setisLoading={setIsLoading}
          gap={12}
        />}
      <Navbar />
      <main>
        {!isLoading && <Home />}
        <Projects />
        {<TechStack
          buildMode={false}
          setFreeze={setFreeze}
          gridGap={60}
          pathGap={8}
          ballSpeed={800}
        />}
        <Contact />
        <About />
      </main>
      <Footer />
      {!isLoading &&
        <>
          <RandomPathCanvas
            freeze={freeze}
            baseInterval={30}
            animationDuration={5000}
            pathFragments={8}
            strokeColor="rgba(255, 0, 153, 0.25)"
            strokeWidth={1.5}
          />
          <MatrixText
            freeze={freeze}
            baseInterval={100}
            baseFontSize={12}
            speedRange={{ min: 100, max: 400 }}
            mutateInterval={10}
            mutateChancePercent={80}
            fillColor="rgba(255, 0, 153, 0.4)"
            charSet={["诶", "比", "西", "迪", "伊", "吉", "艾", "杰", "开", "哦", "屁", "提", "维"]}
          />
        </>}
    </>
  );
}
