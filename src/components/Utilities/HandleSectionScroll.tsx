export default function HandleSectionScroll(element: string) {
  if (element === "home") {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  } else {
    const ele = document.querySelector(`.${element}`) as HTMLDivElement;
    const nav = document.querySelector(".navbar") as HTMLDivElement;

    document.body.scrollTop = ele.offsetTop - nav.offsetHeight * 1.5;
    document.documentElement.scrollTop = ele.offsetTop - nav.offsetHeight * 1.5;
  }

}
