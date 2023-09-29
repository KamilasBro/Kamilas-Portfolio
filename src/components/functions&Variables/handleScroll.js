//isntead of copy and paste the same we pass classname when navbtn is clicked
//code over and over this function will scroll me to desired element
//the substracting navbar height thing is still important here as i mentioned it in Navbar.js
export default function hadleScroll(element) {
  document.body.scrollTop =
    document.querySelector(element).offsetTop -
    document.querySelector(".navbar").offsetHeight;
  document.documentElement.scrollTop =
    document.querySelector(element).offsetTop -
    document.querySelector(".navbar").offsetHeight;
}
