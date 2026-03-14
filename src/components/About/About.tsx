import "./about.scss";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import EncryptText from "../Utilities/DecryptText";

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    if (!aboutRef.current) return;

    const encoded = "YSB0cnVlIG1hc3RlciBpcyBhbiBldGVybmFsIHN0dWRlbnQ=";
    const sentence = atob(encoded).replace(/\s/g, "").toLowerCase();

    // Get all span elements inside the about content
    const allSpans = Array.from(aboutRef.current.querySelectorAll("span"));

    // Prepare a list of spans that match the letters of the hidden sentence in order
    const targetSpans: HTMLElement[] = [];
    let sentenceIndex = 0;

    allSpans.forEach(span => {
      const char = span.textContent?.toLowerCase();
      if (!char) return;

      // Only include spans that match the current letter of the sentence
      if (char === sentence[sentenceIndex]) {
        targetSpans.push(span);
        sentenceIndex++;
      }
    });

    // Exit early if no target spans were found
    if (!targetSpans.length) return;

    // Function to reveal a span by adding a class
    const revealSpan = (el: HTMLElement | null) => {
      // Only operate on valid target spans and skip if already colored
      if (!el || !targetSpans.includes(el) || el.classList.contains("colored")) return;
      el.classList.add("colored");
    };

    // Mouse hover handler
    const handleMouseEnter = (e: MouseEvent) => revealSpan(e.currentTarget as HTMLElement);

    // Touch handler for mobile: reveal span under touch
    const handleTouchMove = (e: TouchEvent) => {
      const target = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
      ) as HTMLElement | null;
      revealSpan(target);
    };

    targetSpans.forEach(span => span.addEventListener("mouseenter", handleMouseEnter));
    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      targetSpans.forEach(span => span.removeEventListener("mouseenter", handleMouseEnter));
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Helper function: wrap each character of a string in a <span>
  function wrapLetters(text: string) {
    return text.split("").map((char, idx) => (
      <span key={idx}>{char}</span>
    ));
  }

  return (
    <section className="about" ref={ref}>
      <EncryptText
        text="About"
        HTMLtag="h1"
        encryptInView={inView}
        className="section-title"
      />
      <EncryptText
        text="Something is hidden here, can you find it?"
        HTMLtag="span"
        encryptInView={inView}
        className="easter-egg-hint"
        iterationsRange={1}
        decryptInterval={8}
      />
      <span hidden>Good luck searching here...</span>
      {/* About content: split into two columns */}
      <div className="about-content-wrap" ref={aboutRef}>
        <div className={!inView ? "not-in-view" : ""}>
          <p>{wrapLetters("A lifelong computer and gaming enthusiast, especially into classic, older games and also TCGs enjoyer.")}</p>
          <p>{wrapLetters("I like taking things apart, tinkering, and making them work no matter how many times I fail.")}</p>
          <p>{wrapLetters("Front-end programming is my main focus right now, but my curiosity doesn't stop there, I'm diving into AI integrations and backend development next.")}</p>
        </div>
        <div className={!inView ? "not-in-view" : ""}>
          <p>{wrapLetters("There's a lot I don't know yet, but that's not enemy which I cannot defeat, every challenge is just another chance to learn and grow.")}</p>
          <p>{wrapLetters("This portfolio shows what I can build, but not all the ways I like to break and fix stuff along the way.")}</p>
        </div>
      </div>
    </section>
  );
}