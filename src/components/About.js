import placeholder from "../images/logo/placeholder.png"
export default function About() {
    return (
        <section className="about">
            <h1 className="section-title">About Me</h1>
            <div className="about-grid">
                <div>
                Passionate video game enthusiast who's also 
                been studying coding for over a year now as a front-end developer.
                <br/> 
                I love diving into the intricate coding behind web 
                development and creating beautiful digital experiences for users.
                <br/>
                <br/>
                When I'm not coding, I love spending time with my rabbit,
                 who never fail to put a smile on my face.
                And when I need to take a break from the computer, I pick up 
                my guitar and strum away, playing my favorite songs.
                </div>
                <div>
                I bring my love for programming to create amazing 
                websites that leave a lasting impression on visitors.
                <br/>
                I'm excited to continue learning and growing as a developer, and 
                I can't wait to see where this journey takes me!
                <br/>
                <br/>
                I am currently diving deep into react, to explore modern 
                technology standards and possibilities.
                <br/>
                <br/>
                In the future, I want to study back-end to become 
                fullstack developer.

                </div>
                <div className="about-photo">
                    <img src={placeholder} alt="myphoto"/>
                </div>
            </div>
        </section>
    )
  }