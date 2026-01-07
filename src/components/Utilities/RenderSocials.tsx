import { ReactComponent as LinkedinSvg } from "../../images/socials/linkedin.svg";
import { ReactComponent as GithubSvg } from "../../images/socials/github.svg";

export default function RenderSocials() {
  return (
    <>
      <a href="https://www.linkedin.com/in/kamil-wr%C3%B3bel-35b559230/" target="_blank" rel="noreferrer">
        <LinkedinSvg />
      </a>
      <a href="https://github.com/KamilasBro" target="_blank" rel="noreferrer">
        <GithubSvg />
      </a>
    </>
  )
}
