import search from "../images/search.png"

import React,{useEffect, useState} from "react"
export default function Projects() {
    const [data, setData]=useState("")
    useEffect(()=>{
        fetch("https://api.jsonbin.io/v3/qs/646619649d312622a360861a")
        .then(res=>res.json())
        .then(data=>setData(data))
        .catch(console.error("error"))
    },[])
    console.log(data)
    return (
        <section className="projects">
            <h1 className="section-title">Projects</h1>
            <div className="projects-list">
                <div className="projects-list-menu">
                    <div className="projects-list-menu-input">
                        <input className="menu-input"/>
                        <div className="search-wrap">
                            <img src={search} alt="search" className="menu-search"/>
                        </div>
                    </div>
                    <ul className="projects-list-menu-buttons">
                        <li className="projects-list-btn">All</li>
                        <li className="projects-list-btn">React</li>
                        <li className="projects-list-btn">Vanilla JS</li>
                        <li className="projects-list-btn">Wordpress</li>
                    </ul>
                </div>
                <div className="projects-list-menu-items">
                    <div className="list-item">
                        <img src={require("../data/projects/images/tenzies.png")} alt="projectimage" className="item-image"/>
                        <div className="item-name">D2R Calculator</div>
                        <div className="item-buttons">
                            <div className="preview">Preview</div>
                            <div className="checkOnGithub">Check on Github</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
  }