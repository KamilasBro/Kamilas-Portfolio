import "./home.scss";
import { ReactComponent as LogoSvg } from "../../images/logo/logoConnected.svg";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Typed from "typed.js";
import { PowerGlitch } from 'powerglitch';

export default function Home({ isLoading }: { isLoading: boolean }) {

  //intersection observer
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  // Refs for text elements to apply Typed.js animations
  const sloganRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const proficiencyRef = useRef<HTMLHeadingElement>(null);

  // Ref for the logo wrapper div (required for PowerGlitch)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const logo = logoRef.current
    //home during load is technicly visible for the browser 
    //so we dont launch animation during loading
    if (!inView || isLoading || !logo) return;

    const baseDuration = 750;
    const baseSlices = 3;

    // Store all timeouts for cleanup
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let intervalId: ReturnType<typeof setInterval>;

    const triggerGlitch = (duration: number, count: number) => {
      PowerGlitch.glitch(logo, {
        timing: {
          duration,
          iterations: 1,
        },
        glitchTimeSpan: { start: 0, end: 0.9 },
        shake: {
          velocity: 15,
          amplitudeX: 0.2,
          amplitudeY: 0.1,
        },
        slice: {
          count,
          velocity: 25,
          minHeight: 1,
          maxHeight: 1,
          cssFilters: 'blur(1px)',
        },
        hideOverflow: true,
      });
    };

    // Initial glitch
    triggerGlitch(baseDuration, baseSlices);

    // Recurring glitch animations scheduled via setInterval + setTimeout
    intervalId = setInterval(() => {
      const t1 = setTimeout(() => {
        triggerGlitch(baseDuration / 4, baseSlices * 2);
      }, baseDuration);

      const t2 = setTimeout(() => {
        triggerGlitch(baseDuration / 4, baseSlices * 2);
      }, baseDuration * 1.4);

      // Keep track of timeouts to clear them on cleanup
      timeouts.push(t1, t2);
    }, baseDuration * 5);

    // Typed.js instances for typing effect on each text element
    const sloganTyped = new Typed(sloganRef.current!, {
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

    const nameTyped = new Typed(nameRef.current!, {
      strings: ["Kamil <span>Kamilas</span> Wróbel"],
      typeSpeed: 50,
      backSpeed: 50,
      showCursor: false,
    });

    const proficiencyTyped = new Typed(proficiencyRef.current!, {
      strings: ["Front-End Developer"],
      typeSpeed: 60,
      backSpeed: 60,
      showCursor: false,
    });

    return () => {
      clearInterval(intervalId);
      timeouts.forEach(clearTimeout);

      sloganTyped.destroy();
      nameTyped.destroy();
      proficiencyTyped.destroy();
    };
  }, [inView, isLoading]);
  return (
    <section className="home" ref={ref}>
      <header className="home-slogan">
        <h1>
          <span ref={sloganRef} />
        </h1>
        <h2 ref={nameRef} />
        <h4 ref={proficiencyRef} />
      </header>
      {/* Wrapper div for PowerGlitch */}
      <div ref={logoRef}>
        <LogoSvg className="home-logo" />
      </div>
    </section>
  );
}
