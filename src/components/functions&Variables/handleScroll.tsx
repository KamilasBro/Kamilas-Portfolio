//isntead of copy and paste the same we pass classname when navbtn is clicked
//code over and over this function will scroll me to desired element
//the substracting navbar height thing is still important here as i mentioned it in Navbar.js
export default function hadleScroll(element: string) {
  const ele = document.querySelector(element) as HTMLDivElement;
  const nav = document.querySelector(".navbar") as HTMLDivElement;
  document.body.scrollTop = ele.offsetTop - nav.offsetHeight;
  document.documentElement.scrollTop = ele.offsetTop - nav.offsetHeight;
}
