//we scroll to the desired section passed as prop

export default function HandleSectionScroll(element: string) {
  //home is considered as first section so we scroll back to the very top
  if (element === "home") {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  } else {
    const ele = document.querySelector(`.${element}`) as HTMLDivElement;
    const nav = document.querySelector(".navbar") as HTMLDivElement;
    //navbar is fixed and it is overlapping content so we subtract its height during calculations
    //for better UX navbar height is multiplied
    const navHeight = nav.offsetHeight * 2;

    document.body.scrollTop = ele.offsetTop - navHeight;
    document.documentElement.scrollTop = ele.offsetTop - navHeight;
  }
}
