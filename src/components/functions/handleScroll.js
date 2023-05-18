export default function hadleScroll(element){
    document.body.scrollTop = 
    (document.querySelector(element).offsetTop - document.querySelector(".navbar").offsetHeight)
    document.documentElement.scrollTop = 
    (document.querySelector(element).offsetTop - document.querySelector(".navbar").offsetHeight)
}