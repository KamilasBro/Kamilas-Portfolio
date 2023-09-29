import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import logo from "../../images/logo/logo.png";
// ../ refers to parent folder of current location
// so 1st ../ refers to components and 2nd ../ refers to src
import "./home.scss";
export default function Home() {
  //we imported typed.js lib to make writing slogan work
  //for more information read typed.js docs
  const ele = useRef(null);

  useEffect(() => {
    const typed = new Typed(ele.current, {
      strings: [
        "Coding With Passion",
        "Designing Innovations",
        "Develop The Future",
      ],
      typeSpeed: 60,
      backSpeed: 60,
      backDelay: 1500,
      loop: true,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);
  return (
    <section className="home">
      <div className="home-slogan">
        <h1>
          <span ref={ele} />
        </h1>
        <h2>
          Kamil <span className="h2-color">Kamilas</span> Wróbel
        </h2>
        <h4>Front-End Developer</h4>
      </div>
      <img src={logo} alt="homelogo" className="home-logo" />
    </section>
  );
}
