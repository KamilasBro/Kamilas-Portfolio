import "./projects.scss";
import { ReactComponent as LinkSvg } from "../../images/projects/link.svg"
import { ReactComponent as FigmaSvg } from "../../images/projects/figma.svg"
import { ReactComponent as GithubSvg } from "../../images/projects/github.svg"
import { ReactComponent as ArrowSvg } from "../../images/projects/arrow.svg"

import React, { useState, useRef, useEffect } from "react";
import projects from "../../data/projects/projects.json";
import getTechStackImg from '../Utilities/getTechStackImg';
import EncryptText from "../Utilities/DecryptText";
import { PowerGlitch } from 'powerglitch';
import { useInView } from "react-intersection-observer";

export default function Projects({ isLoading }: { isLoading: boolean }) {
  const [currentProject, setCurrentProject] = useState(0);
  //determines which project preview is active
  const [viewPortMode, setViewPortMode] = useState<'desktop' | 'mobile'>('desktop');

  const projectsContainerRef = useRef<HTMLDivElement>(null)

  //intersection observer
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  // class for styling on view
  const notInViewClass = (!inView || isLoading) ? "not-in-view" : "";

  const handleProjectChange = async (index: number) => {
    if (currentProject === index) return
    const runGlitch = async () => {
      const duration = 500;
      //using ref with query selector was buggy so specific class is passed
      PowerGlitch.glitch(".project-glitch", {
        timing: {
          duration: duration,
          iterations: 1,
        },
        glitchTimeSpan: {
          start: 0,
          end: 1,
        },
        hideOverflow: true
      });
      await new Promise(res => setTimeout(res, duration));
    };

    const setProjectAndContent = () =>
      new Promise<void>((resolve) => {
        setCurrentProject(index);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

    /* layers from powerglitch need to be hidden after glitching due to
     sizing component up if the content before was longer than current one, it
     was visible in project description */
    // show layers before first glitch

    const container = projectsContainerRef.current;
    if (!container) return;

    container
      .querySelectorAll<HTMLDivElement>("[data-islayer='true']")
      .forEach((el) => {
        el.style.display = "initial";
      });

    //the trick is glitch is DOM dependent
    //so we cannot glitch project change and DOM at the same time, it will break animation
    //so we make illusion of one animation splitting it onto 2 seperate triggers

    // first glitch, show layers then wait for it to finish
    await runGlitch();

    // update project and wait for next content so DOM reflects new data
    await setProjectAndContent();

    // run next glitches after new content is rendered
    await runGlitch();

    //hide layers
    container
      .querySelectorAll<HTMLDivElement>("[data-islayer='true']")
      .forEach((el) => {
        el.style.display = "none";
      });
  };


  //============
  //== MOBILE ==
  //============
  const [isMobile, setIsMobile] = useState(false);

  //overlay for swapping between projects without interacting with them
  const [isGestureOverlayOn, setIsGestureOverlayOn] = useState(true);

  //touch refs
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchActiveRef = useRef(false);

  const SWIPE_THRESHOLD = 100;

  // Stores the initial touch position so we can later calculate swipe direction.
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };

    // Mark that a touch is currently active
    touchActiveRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchActiveRef.current) return;
    const t = e.changedTouches[0];

    // Calculate how far the finger moved from the start position
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;

    // Determine if the gesture is a horizontal swipe
    // - horizontal movement must be greater than vertical
    // - movement must exceed the swipe threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      let nextIndex = currentProject;

      // Swipe left → move to next project
      if (dx < 0) {
        nextIndex = (currentProject + 1) % projects.length;
      }
      // Swipe right → move to previous project
      else {
        nextIndex = (currentProject - 1 + projects.length) % projects.length;
      }
      handleProjectChange(nextIndex);
    }

    // Reset gesture state
    touchActiveRef.current = false;
  };

  // Reset gesture state to avoid stale touch data
  const handleTouchCancel = () => {
    touchActiveRef.current = false;
  };

  //On mobile Card2 is toggable tab, show more is used as trigger to unfold it
  const [showMore, setShowMore] = useState(false);
  // there were a conflict that user in certain scenarios could see the transition of folding/unfolding card2 
  // when it should not happen
  const [foldTransition, setFoldTransition] = useState({
    status: false,
    duration: 200,
  });

  const handleCardFold = () => {
    if (foldTransition.status) {
      setTimeout(() => setFoldTransition((prev) => ({
        ...prev,
        status: false,
      })), foldTransition.duration)
    } else {
      setFoldTransition((prev) => ({
        ...prev,
        status: true,
      }))
    }
    setShowMore(prevState => !prevState)
  }

  //Resize event that checks if mobile breakpoint is active
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024)
        setIsMobile(true);
      else {
        //if not set to false all mobile related states
        setIsMobile(false);
        setShowMore(false);
        setFoldTransition((prev) => ({
          ...prev,
          status: false,
        }))
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="projects" ref={ref}>
      <EncryptText
        text="Projects"
        HTMLtag="h1"
        encryptInView={inView && !isLoading}
        className="section-title"
      />
      <div
        ref={projectsContainerRef}
        className={`projects-container ${notInViewClass}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className={`project-card-wrap ${notInViewClass}`}>
          <div className="project-card1">
            <h2 className="project-title project-glitch">
              {projects[currentProject].title}
              <span className="subtitle">
                {` | ${projects[currentProject].subtitle}`}
              </span>
            </h2>
            <div className="iframe-wrap">
              <div className="iframe-switches project-glitch">
                <div
                  className="viewport-switch"
                  onClick={() => {
                    setViewPortMode(prev => prev === "desktop" ? "mobile" : "desktop")
                  }}
                >
                  <button className={viewPortMode === 'desktop' ? 'active' : ''}>
                    Desktop
                  </button>
                  <button className={viewPortMode === 'mobile' ? 'active' : ''}>
                    Mobile
                  </button>
                </div>
                {isMobile &&
                  <div className="gesture-overlay-switch">
                    <button onClick={() => setIsGestureOverlayOn(prev => !prev)}>
                      Gesture overlay {" "}
                      <span className={isGestureOverlayOn ? "enabled" : "disabled"}>
                        {isGestureOverlayOn ? "Enabled" : "Disabled"}
                      </span>
                    </button>
                  </div>}
              </div>
              <div className="iframe-container project-glitch">
                {isMobile && isGestureOverlayOn &&
                  <div className="gesture-overlay">
                    <p>
                      <ArrowSvg alt="arrowSvg" />
                      <span>Tap</span> to <span>disable</span> {" "}
                      Gesture overlay and <span>interact</span> {" "}
                      with preview. Keep <span>enabled</span> {" "}
                      to <span>swipe</span> comfortably between projects.
                    </p>
                  </div>}
                <iframe
                  loading="lazy"
                  className={viewPortMode === 'desktop' ? 'desktop' : 'mobile'}
                  title={projects[currentProject].title}
                  src={projects[currentProject].livePreviewURL}
                />
              </div>
            </div>
            <ul className="project-panel">
              <a href={projects[currentProject].livePreviewURL} target="_blank" rel="noreferrer">
                <li className="project-panel-button project-glitch">
                  <span>Live Preview</span>
                  <LinkSvg alt="Live Preview" />
                </li>
              </a>
              {projects[currentProject].designPreviewURL &&
                <a href={projects[currentProject].designPreviewURL} target="_blank" rel="noreferrer">
                  <li className="project-panel-button project-glitch">
                    <span>Design Preview</span>
                    <FigmaSvg alt="Design Preview" />
                  </li>
                </a>}
              {projects[currentProject].repositoryURL &&
                <a href={projects[currentProject].repositoryURL} target="_blank" rel="noreferrer">
                  <li className="project-panel-button project-glitch">
                    <span>Repository</span>
                    <GithubSvg alt="Repository" />
                  </li>
                </a>}
            </ul>
          </div>
        </div>
        {/* before there was conditional rendering to mobile and desktop 
        versions but due to conflict with changing from one to another after glitching
        i found that's the best working solution for now
        
        ${!isMobile ? ("glitch") : (showMore && "glitch")}
        (if we choose to glitch always on mobile, we could visibly see the glitching even if card was folded,
        and i didn't want to do weird opacity or conditional rendering for that)
        */}
        <div
          className={`project-card2 ${isMobile ? (showMore ? "show" : "hide") : ""}`}
          style={isMobile && foldTransition.status ? { transition: `${foldTransition.duration}ms` } : {}}
        >
          {isMobile &&
            <div
              className={`project-show-hide-panel ${showMore ? "show" : "hide"}`}
              onClick={handleCardFold}
            >
              <span>{!showMore ? "Show More" : "Hide"}</span>
              <ArrowSvg className={showMore ? "show" : "hide"} alt="arrowSvg" />
            </div>
          }
          <div className={`project-card-wrap-reverse ${notInViewClass}`}>
            <div className={`project-description ${!isMobile ? ("project-glitch") : (showMore && "project-glitch")}`}>
              {projects[currentProject].description}
            </div>
          </div>
          <div className={`project-card-wrap-reverse ${notInViewClass}`}>
            <div className={`project-stack ${!isMobile ? ("project-glitch") : (showMore && "project-glitch")}`}>
              <h3>Build Stack</h3>
              <ul className="stack-list ">
                {projects[currentProject].buildStack.map((stackEle, index) =>
                  <li key={stackEle + index} className="stack-element">
                    {getTechStackImg(stackEle)}
                    <span>{stackEle}</span>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ul className={`dots ${notInViewClass}`}>
        {projects.map((_, index) =>
          <li
            className={index === currentProject ? "dot active" : "dot"}
            key={`dot-${index}`}
            onClick={() => handleProjectChange(index)}
          />)}
      </ul>
    </section>
  );
}