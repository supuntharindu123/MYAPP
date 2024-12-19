import axios from "axios";

export default class Search {
  constructor() {
    this.headersearch = document.querySelector(".searchicon");
    this.backSearch = document.querySelector(".container");

    this.inject();

    // Assign elements after injection
    this.closebtn = document.querySelector(".search-overlay-close");
    this.overlay = document.querySelector(".search-overlay");
    this.inpuField = document.querySelector(".live-search-field");
    this.resultsList = document.querySelector(".live-search-results");
    this.loader = document.querySelector(".circle-loader");
    this.searchbtn = document.querySelector(".search-btn");
    this.typing;
    this.previous = "";
    this.events();
  }

  events() {
    if (this.inpuField) {
      this.inpuField.addEventListener("keyup", () => this.keypress());
    } else {
      console.error("Input field '.live-search-field' not found in the DOM.");
    }

    if (this.headersearch) {
      this.headersearch.addEventListener("click", (e) => {
        e.preventDefault();
        this.openoverlay();
      });
    } else {
      console.error("Search icon '.searchicon' not found in the DOM.");
    }

    if (this.closebtn) {
      this.closebtn.addEventListener("click", () => {
        this.closeOverlay();
      });
    } else {
      console.error(
        "Close button '.search-overlay-close' not found in the DOM."
      );
    }

    this.searchbtn.addEventListener("click", () => this.sendRequest());
  }

  openoverlay() {
    if (this.overlay) {
      this.overlay.classList.add("search-overlay--visible");
      setTimeout(() => this.inpuField?.focus(), 50);
    } else {
      console.error("Overlay element '.search-overlay' not found in the DOM.");
    }
  }

  closeOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove("search-overlay--visible");
    } else {
      console.error("Overlay element '.search-overlay' not found in the DOM.");
    }
  }

  keypress() {
    const value = this.inpuField.value.trim();

    if (value === "") {
      clearTimeout(this.typing);
      this.hideresultsArea();
    } else if (value !== this.previous) {
      clearTimeout(this.typing);
      this.showloader();
      this.hideresultsArea();
      this.typing = setTimeout(() => this.sendRequest(), 1000);
    }

    this.previous = value;
  }

  sendRequest() {
    axios
      .post("/search", { searchTerm: this.inpuField.value })
      .then((response) => {
        console.log("Response:", response.data);
        this.renderResponse(response.data);
      })
      .catch(() => {
        alert("Error sending request");
        this.hideloader();
      });
  }

  renderResponse(posts) {
    if (posts.length) {
      this.resultsList.innerHTML = `
      <div class="mb-2 ml-4 fw-bold"><strong>${
        posts.length
      }</strong> Items Found</div>
      
      ${posts.map((post) => {
        let postdate = new Date(post.createdDate);
        return `<a href="/post/${post._id}">
          <div class="col-md-8 col-lg-6 mb-4">
            <div class="card shadow-sm ">
              <div class="d-flex flex-row align-items-center p-2">
                <img
                  src="${
                    post.author.avatar || "https://via.placeholder.com/100"
                  }"
                  alt="${post.title || "Post"}"
                  class="img-fluid"
                />
                <div class="ml-3">
                  <h5 class="mb-1">${post.title || "Untitled Post"}</h5>
                  <p class="text-muted mb-0">By ${
                    post.author.username || "Unknown"
                  } on ${postdate.getMonth() || "Unknown Date"}/${
          postdate.getDay() || "Unknown Date"
        }/${postdate.getFullYear() || "Unknown Date"}</p>
                </div>
              </div>
            </div>
          </div></a>`;
      })}`;
    } else {
      this.resultsList.innerHTML = `
        <p class="alert alert-danger">Sorry, no results found for your query.</p>
      `;
    }

    this.hideloader();
    this.showresultsArea();
  }

  showloader() {
    if (this.loader) {
      this.loader.classList.add("circle-loader--visible");
    }
  }

  hideloader() {
    if (this.loader) {
      this.loader.classList.remove("circle-loader--visible");
    }
  }

  showresultsArea() {
    if (this.resultsList) {
      this.resultsList.classList.add("live-search-results--visible");
    }
  }

  hideresultsArea() {
    if (this.resultsList) {
      this.resultsList.classList.remove("live-search-results--visible");
    }
  }

  inject() {
    if (this.backSearch) {
      this.backSearch.insertAdjacentHTML(
        "afterbegin",
        `<div class="align-items-center search-overlay">
          <div class="search-overlay-top shadow-sm p-3 bg-white rounded w-75">
            <label for="live-search-field" class="search-overlay-icon">
              <i class="fa fa-search"></i>
            </label>
            <input
              type="text"
              id="live-search-field"
              class="live-search-field form-control"
              placeholder="What are you interested in?"
            />
            <div class="d-flex mt-3 mb-5">
              <button type="submit" class="btn btn-primary mr-2 search-btn">
                <i class="fa fa-search"></i> Search
              </button>
              <button type="button" class="btn btn-danger search-overlay-close">
                <i class="fa fa-close"></i> Close
              </button>
            </div>
            <div class="circle-loader"></div>
            <div class="live-search-results coloum justify-content-center align-content-center"></div>
          </div>
        </div>`
      );
    } else {
      console.error("Cannot inject HTML: '.container' element not found.");
    }
  }
}
