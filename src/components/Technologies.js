import htmlImg from "../images/technologies/html.png"
import cssImg from "../images/technologies/css.png"
import jsImg from "../images/technologies/js.png"
import reactImg from "../images/technologies/react.png"
import { htmlSkills } from "../data/technologies/htmlSkills"
import { cssSkills } from "../data/technologies/cssSkills"
import { jsSkills } from "../data/technologies/jsSkills"
import { reactSkills } from "../data/technologies/react"
import React,{useState} from "react"

export default function Technologies() {
    const [currentTech, setCurrentTech]=useState("html")
    return (
        <section className="technologies">
            <h1 className="section-title">Technologies</h1>
            <ul className="technologies-menu">
                <li><img 
                    src={htmlImg} 
                    alt="html" 
                    className="technologies-button"
                    style={currentTech==="html"?{filter:"grayscale(0%)"}:{filter:"grayscale(100%)"}}
                    onClick={()=>setCurrentTech("html")}
                    /></li>
                <li><img 
                    src={cssImg} 
                    alt="css" 
                    className="technologies-button"
                    style={currentTech==="css"?{filter:"grayscale(0%)"}:{filter:"grayscale(100%)"}}
                    onClick={()=>setCurrentTech("css")}
                    /></li>
                <li><img 
                    src={jsImg} 
                    alt="js" 
                    className="technologies-button"
                    style={currentTech==="js"?{filter:"grayscale(0%)"}:{filter:"grayscale(100%)"}}
                    onClick={()=>setCurrentTech("js")}
                    /></li>
                <li><img 
                    src={reactImg} 
                    alt="react" 
                    className="technologies-button"
                    style={currentTech==="react"?{filter:"grayscale(0%)"}:{filter:"grayscale(100%)"}}
                    onClick={()=>setCurrentTech("react")}
                    /></li>
            </ul>
            {currentTech==="html"?
                htmlSkills.map((ele,index)=>{
                    return(
                        <div className="technologies-chart" key={index}>
                            <div className="chart-text">
                                <span className="chart-property">{ele.property}</span>
                                <span className="chart-precentage">{ele.precentage}%</span>
                            </div>
                            <div className="chart-bar">
                                <div 
                                    className="chart-inner-bar" 
                                    style={{
                                        background:"linear-gradient(90deg, #E34C26 0%, #F06529 100%)",
                                        boxShadow:"0px 0px 30px 4px rgba(227, 76, 38, 0.25)",
                                        width:`${ele.precentage}%`
                                    }}
                                />
                            </div>
                        </div>
                    )
                })
            :currentTech==="css"?
            cssSkills.map((ele,index)=>{
                return(
                    <div className="technologies-chart" key={index}>
                        <div className="chart-text">
                            <span className="chart-property">{ele.property}</span>
                            <span className="chart-precentage">{ele.precentage}%</span>
                        </div>
                        <div className="chart-bar">
                            <div 
                                className="chart-inner-bar" 
                                style={{
                                    background:"linear-gradient(90deg, #2965f1 0%, #264de4 100%)",
                                    boxShadow:"0px 0px 30px 4px rgba(41, 101, 241, 0.25)",
                                    width:`${ele.precentage}%`
                                }}
                            />
                        </div>
                    </div>
                )
            })
            :currentTech==="js"?
            jsSkills.map((ele,index)=>{
                return(
                    <div className="technologies-chart" key={index}>
                        <div className="chart-text">
                            <span className="chart-property">{ele.property}</span>
                            <span className="chart-precentage">{ele.precentage}%</span>
                        </div>
                        <div className="chart-bar">
                            <div 
                                className="chart-inner-bar" 
                                style={{
                                    background:"linear-gradient(180deg, #F7DF1E 0%, #F7DF1E 100%)",
                                    boxShadow:"0px 0px 30px 4px rgba(247, 223, 30, 0.25)",
                                    width:`${ele.precentage}%`
                                }}
                            />
                        </div>
                    </div>
                )
            })
        :reactSkills.map((ele,index)=>{
            return(
                <div className="technologies-chart" key={index}>
                    <div className="chart-text">
                        <span className="chart-property">{ele.property}</span>
                        <span className="chart-precentage">{ele.precentage}%</span>
                    </div>
                    <div className="chart-bar">
                        <div 
                            className="chart-inner-bar" 
                            style={{
                                background:"linear-gradient(90deg, #88DDED 0%, #7CC5D9 100%)",
                                boxShadow:"0px 0px 30px 4px rgba(136, 221, 237, 0.25)",
                                width:`${ele.precentage}%`
                            }}
                        />
                    </div>
                </div>
            )
        })}
        </section>
    )
  }