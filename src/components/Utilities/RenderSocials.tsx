import { useEffect, useRef } from "react";
import { ReactComponent as LinkedinSvg } from "../../images/socials/linkedin.svg";
import { ReactComponent as GithubSvg } from "../../images/socials/github.svg";

export default function RenderSocials({ propClass }: { propClass: string }) {
  // Ref to the container div so we can manipulate only the SVGs inside this component
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile fix: duplicated SVGs with gradients can render transparent
  // because <linearGradient> IDs collide when SVGs are reused.
  // This useEffect ensures each SVG gets unique IDs on render.
  useEffect(() => {
    if (!containerRef.current) return;

    const svgs = containerRef.current.querySelectorAll<SVGSVGElement>(".socials-svg");

    svgs.forEach((svg) => {
      svg.querySelectorAll<SVGElement>("[id]").forEach((el) => {
        const oldId = el.id;
        const newId = `${oldId}-${Math.random().toString(36).slice(2, 8)}`;
        el.id = newId;

        // Update any references to the old ID in `fill` or `clip-path` attributes
        // This ensures gradients and clipPaths point to the correct new ID
        svg.querySelectorAll<SVGElement>(`[fill="url(#${oldId})"], [clip-path="url(#${oldId})"]`).forEach((refEl) => {
          if (refEl.hasAttribute("fill")) refEl.setAttribute("fill", `url(#${newId})`);
          if (refEl.hasAttribute("clip-path")) refEl.setAttribute("clip-path", `url(#${newId})`);
        });
      });
    });

  }, []);

  return (
    <div className={`socials ${propClass}`} ref={containerRef}>
      <a
        href="https://www.linkedin.com/in/kamil-wr%C3%B3bel-35b559230/"
        target="_blank"
        rel="noreferrer"
      >
        <LinkedinSvg className="socials-svg" />
      </a>
      <a
        href="https://github.com/KamilasBro"
        target="_blank"
        rel="noreferrer">
        <GithubSvg className="socials-svg" />
      </a>
    </div>
  );
}