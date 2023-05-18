import React from 'react';
import Typed from 'typed.js';
import placeholder from "../images/logo/placeholder.png"
export default function Home() {
    const ele = React.useRef(null);

    React.useEffect(() => {
      const typed = new Typed(ele.current, {
        strings: [
            'Coding With Passion', 
            'Designing Innovations'
            ,'Develop The Future'],
        typeSpeed: 60,
        backSpeed: 60,
        backDelay: 1500,
        loop: true
      });
  
      return () => {
        // Destroy Typed instance during cleanup to stop animation
        typed.destroy();
      };
    }, []);
    return (
        <section className="home">
            <div className="home-slogan">
                <h1><span ref={ele} /></h1>
                <h2>Kamil <span className='h2-color'>Kamilas</span> Wróbel</h2>
                <h4>Front-End Developer</h4>
            </div>
            <img src={placeholder} alt="homelogo" className="home-logo"/>
        </section>
    )
  }