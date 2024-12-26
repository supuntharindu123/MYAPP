import axios from "axios";

export default class Files {
  constructor() {
    alert("File");
    this.photoInput = document.getElementById("photo");
    this.event();
  }

  event() {
    this.photoInput.addEventListener("change", async (e) => {
      e.preventDefault();
      console.log("Photo changed");
      if (this.photoInput.files.length > 0) {
        try {
          const fileName = this.photoInput.files[0].name;
          const res = await axios.post("/create-post", { filename: fileName });
          console.log(`filename`, res);
        } catch (err) {
          console.log("Error", err);
        }
      }
    });
  }
}
