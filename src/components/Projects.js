import search from "../images/search.png"
import datajs from "../data/projects/data"
import clearSearch from "../images/clear.png"
import React,{useState} from "react"

export default function Projects() {
    const [currentFilter, setCurrentFilter]=useState("all")
    const [currentSearch, setCurrentSearch]=useState("")
    const [isClearVis, setIsClearVis]=useState(false)
    function searchProjects(){
        switch(currentFilter){
            case "all":
                return(
                    datajs().map(e=>{
                        if(currentSearch===""){
                            return(
                                <div className="list-item" key={e.id}>
                                    <img src={require(`../data/projects/images/${e.imgName}`)} alt="projectimage" className="item-image"/>
                                    <div className="item-name">{e.name}{e.firstProject&&<sup>1st Project!</sup>}</div>
                                    <div className="item-buttons" style={e.createdIn==="wordpress"?{justifyContent: "center"}:{}}>
                                        {e.notWorking===true?
                                            <div className="noPreview"><s>Preview</s></div>
                                        :<a href={e.previewURL} target="_blank" rel="noreferrer">
                                            <div className="preview">Preview</div>
                                        </a>}
                                        {e.githubURL&&<a href={e.githubURL} target="_blank" rel="noreferrer">
                                            <div className="checkOnGithub">Check on Github</div>
                                        </a>}
                                    </div>
                                </div>)
                        }else if(e.name.toLowerCase().includes(currentSearch)===true){
                            return(
                                <div className="list-item" key={e.id}>
                                    <img src={require(`../data/projects/images/${e.imgName}`)} alt="projectimage" className="item-image"/>
                                    <div className="item-name">{e.name}{e.firstProject&&<sup>1st Project!</sup>}</div>
                                    <div className="item-buttons" style={e.createdIn==="wordpress"?{justifyContent: "center"}:{}}>
                                        {e.notWorking===true?
                                            <div className="noPreview"><s>Preview</s></div>
                                        :<a href={e.previewURL} target="_blank" rel="noreferrer">
                                            <div className="preview">Preview</div>
                                        </a>}
                                        {e.githubURL&&<a href={e.githubURL} target="_blank" rel="noreferrer">
                                            <div className="checkOnGithub">Check on Github</div>
                                        </a>}
                                    </div>
                                </div>)
                        }else{
                            
                            return(null)
                        }
                    })
                )
            default:
                return(
                    datajs().map(e=>{
                        if(currentSearch===""){
                            if(currentFilter===e.createdIn){
                                return(
                                    <div className="list-item" key={e.id}>
                                        <img src={require(`../data/projects/images/${e.imgName}`)} alt="projectimage" className="item-image"/>
                                        <div className="item-name">{e.name}{e.firstProject&&<sup>1st Project!</sup>}</div>
                                        <div className="item-buttons" style={e.createdIn==="wordpress"?{justifyContent: "center"}:{}}>
                                            {e.notWorking===true?
                                                <div className="noPreview"><s>Preview</s></div>
                                            :<a href={e.previewURL} target="_blank" rel="noreferrer">
                                                <div className="preview">Preview</div>
                                            </a>}
                                            {e.githubURL&&<a href={e.githubURL} target="_blank" rel="noreferrer">
                                                <div className="checkOnGithub">Check on Github</div>
                                            </a>}
                                        </div>
                                    </div>)
                            }else{
                                
                                return(null)
                            }
                        }else if(e.name.toLowerCase().includes(currentSearch)===true){
                            if(currentFilter===e.createdIn){
                                return(
                                    <div className="list-item" key={e.id}>
                                        <img src={require(`../data/projects/images/${e.imgName}`)} alt="projectimage" className="item-image"/>
                                        <div className="item-name">{e.name}{e.firstProject&&<sup>1st Project!</sup>}</div>
                                        <div className="item-buttons" style={e.createdIn==="wordpress"?{justifyContent: "center"}:{}}>
                                            {e.notWorking===true?
                                                <div className="noPreview"><s>Preview</s></div>
                                            :<a href={e.previewURL} target="_blank" rel="noreferrer">
                                                <div className="preview">Preview</div>
                                            </a>}
                                            {e.githubURL&&<a href={e.githubURL} target="_blank" rel="noreferrer">
                                                <div className="checkOnGithub">Check on Github</div>
                                            </a>}
                                        </div>
                                    </div>)
                            }else{
                                
                                return(null)
                            }
                        }else{
                            
                            return(null)
                        }
                    })
                )
        }
    }
    return (
        <section className="projects">
            <h1 className="section-title">Projects</h1>
            <div className="projects-list">
                <div className="projects-list-menu">
                    <div className="search-bar">
                        <div className="search-input-wrap">
                            <input 
                            className="search-input" 
                            placeholder="Search"
                            onKeyDown={(event)=>{
                                if(event.key==='Enter'){
                                    if(document.querySelector(".search-input").value!=="")
                                    setCurrentSearch(document.querySelector(".search-input").value)
                                }
                            }}
                            onChange={(event)=>{
                                if(event.target.value===""){
                                    setIsClearVis(false)
                                    setCurrentSearch("")
                                }else{
                                    setIsClearVis(true)
                                }
                            }}
                            />
                            {isClearVis&&
                            <img 
                            src={clearSearch} 
                            alt="clearsearch" 
                            className="clear-search"
                            onClick={()=>{
                                setIsClearVis(false)
                                document.querySelector(".search-input").value="";
                                setCurrentSearch("")
                            }}
                            />}
                        </div>
                        <div className="search-icon-wrap"
                            onClick={()=>{
                                if(document.querySelector(".search-input").value!=="")
                                setCurrentSearch(document.querySelector(".search-input").value)
                            }}>
                            <img 
                            src={search} 
                            alt="search"
                            />
                        </div>
                    </div>
                    <ul className="projects-list-menu-buttons">
                        <li className="projects-list-btn"
                            style={currentFilter==="all"?{backgroundColor: "#FF0099", color: "#171717"}:{}} 
                            onClick={()=>setCurrentFilter("all")}>
                            All
                        </li>
                        <li className="projects-list-btn"
                            style={currentFilter==="react"?{backgroundColor: "#FF0099", color: "#171717"}:{}} 
                            onClick={()=>setCurrentFilter("react")}>
                            React
                        </li>
                        <li className="projects-list-btn"
                            style={currentFilter==="javascript"?{backgroundColor: "#FF0099", color: "#171717"}:{}} 
                            onClick={()=>setCurrentFilter("javascript")}>
                            Vanilla JS
                        </li>
                        <li className="projects-list-btn"
                            style={currentFilter==="wordpress"?{backgroundColor: "#FF0099", color: "#171717"}:{}} 
                            onClick={()=>setCurrentFilter("wordpress")}>
                            Wordpress
                        </li>
                    </ul>
                </div>
                <div className="projects-list-menu-items">

                    {searchProjects()}
                </div>
            </div>
        </section>
    )
  }