import "./projects.scss";

import { PowerGlitch } from 'powerglitch';
import React, { useState, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import projects from "../../data/projects/projects.json";
import linkSvg from "../../images/projects/link.svg"
import figmaSvg from "../../images/projects/figma.svg"
import githubSvg from "../../images/projects/github.svg"
import arrowSvg from "../../images/projects/arrow.svg"
import EncryptText from "../Utilities/EncryptText";


export default function Projects() {
  const [currentProject, setCurrentProject] = useState(0);
  const [viewPortMode, setViewPortMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isGestureOverlayOn, setIsGestureOverlayOn] = useState(true);
  // there were a conflict that user in certain scenarios could see the transition of folding/unfolding card2 
  // when it didnt suppose to happen
  // thats why it is there
  const [foldTransition, setFoldTransition] = useState({
    status: false,
    duration: 200,
  });

  const { ref, inView } = useInView({
    triggerOnce: true,
  });


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024)
        setIsMobile(true);
      else {
        setIsMobile(false);
        setShowMore(false);
        setFoldTransition((prev) => ({
          ...prev,
          status: false,
        }))
      }

    };

    handleResize(); // set initial value on mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleProjectChange = async (index: number) => {
    if (currentProject === index) return

    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const runGlitch = () => {
      PowerGlitch.glitch('.glitch', {
        timing: {
          duration: 500,
          iterations: 1,
        },
        glitchTimeSpan: {
          start: 0,
          end: 1,
        },
        hideOverflow: true
      });
      return wait(500);
    };

    const setProjectAndContent = () =>
      new Promise<void>((resolve) => {
        setCurrentProject(index);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    // show layers before first glitch
    document
      .querySelectorAll("div[data-islayer='true']")
      .forEach((el) => {
        (el as HTMLElement).style.display = 'initial';
      });

    // first glitch, show layers then wait for it to finish
    await runGlitch();

    // update project and wait for next content so DOM reflects new data
    await setProjectAndContent();

    // run next glitches after new content is rendered
    await runGlitch();

    /* layers from powerglitch need to be hidden after glitching due to
     sizing component up if the content before was longer than current one, it
     was visible in project description */
    document
      .querySelectorAll("div[data-islayer='true']")
      .forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
  };

  const handleCardFold = () => {
    ;
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

  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchActiveRef = useRef(false);
  const SWIPE_THRESHOLD = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    touchActiveRef.current = true;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchActiveRef.current) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      let nextIndex = currentProject;

      if (dx < 0) {
        nextIndex = (currentProject + 1) % projects.length;
      } else {
        nextIndex = (currentProject - 1 + projects.length) % projects.length;
      }

      handleProjectChange(nextIndex);
    }

    touchActiveRef.current = false;
  };

  const handleTouchCancel = () => {
    touchActiveRef.current = false;
  };
  return (
    <section className="projects" ref={ref}>
      <EncryptText
        text="Projects"
        HTMLtag="h1"
        encryptInView={inView}
        className="section-title"
      />
      <div
        className={`projects-container ${!inView && "not-in-view"}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className={`project-card-wrap ${!inView && "not-in-view"}`}>
          <div className="project-card1">
            <h2 className="project-title glitch">{projects[currentProject].title}<span className="subtitle">{` | ${projects[currentProject].subtitle}`}</span></h2>
            <div className="iframe-wrap">
              <div className="iframe-switches glitch">
                <div
                  className="viewport-switch"
                  onClick={() => {
                    if (viewPortMode === "desktop") {
                      setViewPortMode('mobile')
                    } else if (viewPortMode === "mobile") {
                      setViewPortMode('desktop')
                    }
                  }}
                >
                  <button
                    className={viewPortMode === 'desktop' ? 'active' : ''}
                  >
                    Desktop
                  </button>
                  <button
                    className={viewPortMode === 'mobile' ? 'active' : ''}>
                    Mobile
                  </button>
                </div>
                {isMobile && <div className="gesture-overlay-switch">
                  <button onClick={() => setIsGestureOverlayOn(prev => !prev)}>
                    Gesture overlay {" "}
                    <span className={isGestureOverlayOn ? "enabled" : "disabled"}>
                      {isGestureOverlayOn ? "Enabled" : "Disabled"}
                    </span>
                  </button>
                </div>}
              </div>
              <div className="iframe-container glitch">
                {isMobile && isGestureOverlayOn &&
                  <div className="gesture-overlay">
                    <p><img src={arrowSvg} alt="arrowSvg" /><span>Tap</span> to <span>disable</span> Gesture overlay and <span>interact</span> with preview. Keep <span>enabled</span> to <span>swipe</span> comfortably between projects.</p>
                  </div>}
                <iframe loading="lazy" className={viewPortMode === 'desktop' ? 'desktop' : 'mobile'} title={projects[currentProject].title} src={projects[currentProject].livePreviewURL}></iframe>
              </div>
            </div>
            <ul className="project-panel">
              <a href={projects[currentProject].livePreviewURL} target="_blank" rel="noreferrer">
                <li className="project-panel-button glitch">
                  <span>Live Preview</span>
                  <img src={linkSvg} alt="Live Preview" />
                </li>
              </a>
              {projects[currentProject].designPreviewURL &&
                <a href={projects[currentProject].designPreviewURL} target="_blank" rel="noreferrer">
                  <li className="project-panel-button glitch">
                    <span>Design Preview</span>
                    <img src={figmaSvg} alt="Design Preview" />
                  </li>
                </a>}
              {projects[currentProject].repositoryURL &&
                <a href={projects[currentProject].repositoryURL} target="_blank" rel="noreferrer">
                  <li className="project-panel-button glitch">
                    <span>Repository</span>
                    <img src={githubSvg} alt="Repository" />
                  </li>
                </a>}

            </ul>
          </div>
        </div>
        {/* before there was conditional rendering to mobile and desktop 
        versions but due to conflict with changing from one to another after glitching
        i found that's the best working solution for now
        
        ${!isMobile ? ("glitch") : (showMore && "glitch")}
        we want to glitch things always on desktop and only when card2 is unfolded on mobile
        (if we choose to glitch always on mobile, we could visibly see the glitching even if card was folded,
        and i didn't want to do weird opacity or conditional rendering for that)
        */}
        <div className={`project-card2 ${isMobile && (showMore ? "show" : "hide")}`}
          style={isMobile && foldTransition.status ? { transition: `${foldTransition.duration}ms` } : {}}>
          {isMobile && <>
            <div className={`project-show-hide-panel ${showMore ? "show" : "hide"}`}
              onClick={handleCardFold}
            >
              <span>{!showMore ? "Show More" : "Hide"}</span>
              <img className={showMore ? "show" : "hide"} src={arrowSvg} alt="arrowSvg" />
            </div>
          </>}
          <div className={`project-card-wrap-reverse ${!inView && "not-in-view"}`}>
            <div className={`project-description ${!isMobile ? ("glitch") : (showMore && "glitch")}`}>
              {projects[currentProject].description}
            </div>
          </div>
          <div className={`project-card-wrap-reverse ${!inView && "not-in-view"}`}>
            <div className={`project-stack ${!isMobile ? ("glitch") : (showMore && "glitch")}`}>
              <h3>Build Stack</h3>
              <ul className="stack-list ">
                {projects[currentProject].buildStack.map((stackEle, index) =>
                  <li key={stackEle + index} className="stack-element">
                    <img
                      src={require(`../../images/techStack/${stackEle.trim().toLowerCase().replace(/\s/g, '')}.svg`)}
                      alt={stackEle}></img>
                    <span>{stackEle}</span>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ul className={`dots ${!inView && "not-in-view"}`}>
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