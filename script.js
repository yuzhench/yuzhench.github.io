function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}


myButton.addEventListener(
  "click",
  function () {
      myPopup.classList.add("show");
  }
);
closePopup.addEventListener(
  "click",
  function () {
      myPopup.classList.remove(
          "show"
      );
  }
);
window.addEventListener(
  "click",
  function (event) {
      if (event.target == myPopup) {
          myPopup.classList.remove(
              "show"
          );
      }
  }
);