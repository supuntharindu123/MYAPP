// import axios from "axios";

// export default class Like {
//   constructor() {
//     this.likebtn = document.getElementsByClassName("likebtn");
//     this.event();
//   }

//   event() {
//     Array.from(this.likebtn).forEach((like) => {
//       like.addEventListener("click", async (e) => {
//         e.preventDefault();
//         let id = like.getAttribute("data");
//         console.log("id: " + id);
//         try {
//           let res = await axios
//             .post("/", { ids: id })
//             .then(() => {
//               console.log("Liked!", res);
//             })
//             .catch((e) => {
//               console.log("Error", e);
//             });
//         } catch (e) {
//           console.log("Error", e);
//         }
//       });
//     });

//     console.log("hello world");
//   }
// }
