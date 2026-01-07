import { useEffect, useRef } from "react";
import "./about.scss";

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (e: MouseEvent | TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.classList.contains("colored")) return;
    target.classList.add("colored");
  };

  const handleTouchMove = (event: TouchEvent) => {
    const target = document.elementFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY
    ) as HTMLElement;

    if (target?.classList.contains("colored")) return;
    target?.classList.add("colored");
  };

  useEffect(() => {
    if (!aboutRef.current) return;

    const spans = aboutRef.current.querySelectorAll("span");

    spans.forEach((span) => {
      span.addEventListener("mouseenter", handleColorChange);
    });

    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      spans.forEach((span) => {
        span.removeEventListener("mouseenter", handleColorChange);
      });
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <section className="about">
      <h1 className="section-title">About</h1>
      <span className="easter-egg-hint">
        Something is hidden here, can you find it?
      </span>
      <span hidden>Hey, don't look for clue here, it's cheating!</span>
      <div className="about-content-wrap" ref={aboutRef}>
        <div>
          <p>
            <span>A</span> lifelong compu<span>t</span>e<span>r</span> and gaming
            enth<span>u</span>siast, <span>e</span>specially into classic, older
            ga<span>m</span>es <span>a</span>nd also TCG<span>s</span> enjoyer.
          </p>
          <p>
            I like <span>t</span>aking things apart, tink<span>er</span>ing, and
            mak<span>i</span>ng them work no matter how many time<span>s</span> I
            f<span>a</span>il.
          </p>
          <p>
            Fro<span>n</span>t-<span>e</span>nd programming is my main focus
            righ<span>t</span> now, but my curiosity do<span>e</span>sn't stop
            the<span>r</span>e, I'm diving into AI i<span>n</span>tegrations{" "}
            <span>a</span>nd backend deve<span>l</span>opment next.
          </p>
        </div>
        <div>
          <p>
            There'<span>s</span> a lot I don'<span>t</span> know yet, b<span>u</span>t
            that's not enemy which i cannot <span>d</span>efeat, <span>e</span>very
            challe<span>n</span>ge is just ano<span>t</span>her chance to learn and
            grow.
          </p>
          <p>
            This portfolio shows what I can build, but not all the ways I like to
            break and fix stuff along the way.
          </p>
        </div>
      </div>
    </section>
  );
}
