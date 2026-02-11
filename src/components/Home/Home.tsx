import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import { ReactComponent as LogoSvg } from "../../images/logo/logoConnected.svg";
import { useInView } from "react-intersection-observer";
import { PowerGlitch } from 'powerglitch';
import "./home.scss";
export default function Home() {

  const sloganRef = useRef(null);
  const nameRef = useRef(null);
  const proficiencyRef = useRef(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  useEffect(() => {
    if (inView) {
      PowerGlitch.glitch('.home-logo', {
        timing: {
          duration: 750,
          iterations: 1,
        },
        glitchTimeSpan: {
          start: 0,
          end: 0.9,
        },
        shake: {
          velocity: 15,
          amplitudeX: 0.2,
          amplitudeY: 0.1,
        },
        slice: {
          count: 3,
          velocity: 25,
          minHeight: 1,
          maxHeight: 1,
          cssFilters: 'blur(1px)',
        },
        hideOverflow: true,
        createContainers: false,
      });
      setTimeout(() => {
        PowerGlitch.glitch('.home-logo', {
          timing: {
            duration: 150,
            iterations: 1,
          },
          glitchTimeSpan: {
            start: 0,
            end: 0.9,
          },
          shake: {
            velocity: 15,
            amplitudeX: 0.2,
            amplitudeY: 0.1,
          },
          slice: {
            count: 5,
            velocity: 25,
            minHeight: 1,
            maxHeight: 1,
            cssFilters: 'blur(1px)',
          },
          hideOverflow: true,
          createContainers: false,
        });

      }, 850);
      setTimeout(() => {
        PowerGlitch.glitch('.home-logo', {
          timing: {
            duration: 100,
            iterations: 1,
          },
          glitchTimeSpan: {
            start: 0,
            end: 0.9,
          },
          shake: {
            velocity: 15,
            amplitudeX: 0.2,
            amplitudeY: 0.1,
          },
          slice: {
            count: 5,
            velocity: 25,
            minHeight: 1,
            maxHeight: 1,
            cssFilters: 'blur(1px)',
          },
          hideOverflow: true,
          createContainers: false,
        });

      }, 1100);

      const sloganTyped = new Typed(sloganRef.current, {
        strings: [
          "Code With Intent",
          "Design What Matters",
          "Develop The Future",
        ],
        typeSpeed: 40,
        backSpeed: 40,
        backDelay: 1500,
        loop: true,
      });
      const nameTyped = new Typed(nameRef.current, {
        strings: [
          "Kamil <span>Kamilas</span> Wróbel"
        ],
        typeSpeed: 50,
        backSpeed: 50,
        showCursor: false
      });
      const proficiencyTyped = new Typed(proficiencyRef.current, {
        strings: [
          "Front-End Developer"
        ],
        typeSpeed: 60,
        backSpeed: 60,
        showCursor: false
      });

      return () => {
        sloganTyped.destroy();
        nameTyped.destroy();
        proficiencyTyped.destroy();
      };
    }

  }, [inView]);
  return (
    <section className="home" ref={ref}>
      <header className="home-slogan">
        <h1>
          <span ref={sloganRef} />
        </h1>
        <h2 ref={nameRef} />
        <h4 ref={proficiencyRef} />
      </header>
      <LogoSvg className="home-logo" />
    </section>
  );
}
