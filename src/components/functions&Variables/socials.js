//same logic as in handleScroll.js but we pass the social name string
//the socials are not that repeatable to code so its not necessary
//however this code used to do different thing before so i decide to leave the way it is coded
export default function socials(element) {
  switch (element) {
    case "linkedin":
      return "https://www.linkedin.com/in/kamil-wr%C3%B3bel-35b559230/";
    case "github":
      return "https://github.com/KamilasBro";
    case "fiverr":
      return "https://www.fiverr.com/kamilasbro";
    default:
      break;
  }
}
