import Search from "./modules/search";
import Chat from "./modules/chat";
import Registation from "./modules/registation";
import Like from "./modules/like";
import Files from "./modules/file";
import Spa from "./modules/spa";

if (document.querySelector(".chat-wrapper")) {
  new Chat();
  Spa();
}

if (document.querySelector(".searchicon")) {
  new Search();
}

if (document.querySelector(".registation-form")) {
  new Registation();
}

new Files();
