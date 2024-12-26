import axios from "axios";

export default class Registation {
  constructor() {
    this.form = document.querySelector(".registation-form");
    this.mysignin = document.querySelector(".mybtnsignin");
    this.loginusername = document.querySelector(".loginusername");
    this.mysignup = document.querySelector(".mybtnsignup");
    this.registerusername = document.querySelector(".registerusername");
    this.allfield = document.querySelectorAll(
      ".registation-form .form-control"
    );
    this.insertvalidation();
    this.username = document.querySelector("#username-register");
    this.email = document.querySelector("#email-register");
    this.username.previousvalue = "";
    this.email.previousvalue = "";
    this.password = document.querySelector("#password-register");
    this.password.previousvalue = "";
    this.username.isUnique = false;
    this.email.isUnique = false;
    this.password.isUnique = false;
    this.events();
  }

  events() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.formsubmithandle();
    });
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler);
    });
    this.password.addEventListener("keyup", () => {
      this.isDifferent(this.password, this.passwordHandler);
    });
    this.mysignin.addEventListener("click", () => {
      this.loginusername.focus();
    });
    this.mysignup.addEventListener("click", () => {
      this.registerusername.focus();
    });
  }

  formsubmithandle() {
    this.usernameImmediately();
    this.usernameAfterDelay();
    this.emailAfterDelay();
    this.passwordImmediately();
    this.passwordAfterDelay();

    if (
      this.username.isUnique &&
      this.email.isUnique &&
      !this.email.error &&
      !this.password.error &&
      !this.username.error
    ) {
      this.form.submit();
    }
  }

  isDifferent(el, handle) {
    if (el.previousvalue != el.value) {
      handle.call(this);
    }
    el.previousvalue = el.value;
  }

  usernameImmediately() {
    if (
      this.username.value != "" &&
      !/^([a-zA-Z0-9 ]+)$/.test(this.username.value)
    ) {
      this.showerror(
        this.username,
        "Username can only contain letters, numbers, and spaces"
      );
    }

    if (this.username.value.length > 30) {
      this.showerror(this.username, "Username can be less than 30 characters");
    }
    if (!this.username.error) {
      this.hideValidater(this.username);
    }
  }

  hideValidater(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible");
  }

  usernameAfterDelay() {
    if (this.username.value.length <= 3) {
      this.showerror(this.username, "Username must be at least 3 characters");
    }
    if (!this.username.error) {
      axios
        .post("/usernameexist", { username: this.username.value })
        .then((response) => {
          if (response.data) {
            console.log(`helor`, response.data);
            this.showerror(this.username, "The username is already Exist");
            this.username.isUnique = false;
          } else {
            this.username.isUnique = true;
          }
        })
        .catch(() => {
          console.log("please try again");
        });
    }
  }
  showerror(el, message) {
    el.nextElementSibling.innerHTML = message;
    el.nextElementSibling.classList.add("liveValidateMessage--visible");
    el.error = true;
  }

  usernameHandler() {
    this.username.error = false;
    this.usernameImmediately();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => {
      this.usernameAfterDelay();
    }, 500);
  }

  emailHandler() {
    this.username.error = false;
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => {
      this.emailAfterDelay();
    }, 500);
  }

  passwordHandler() {
    this.password.error = false;
    this.passwordImmediately();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(() => {
      this.passwordAfterDelay();
    }, 500);
  }

  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showerror(
        this.password,
        "Password can't be more than 50 characters"
      );
    }

    if (this.password.error) {
      this.hideValidater(this.password);
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 8) {
      this.showerror(
        this.password,
        "Password must be at least 8 characters long"
      );
    }
  }

  emailAfterDelay() {
    if (!/^\S+@\S+$/.test(this.email.value)) {
      this.showerror(this.email, "You must provide a valid email address");
    }
    if (!this.email.error) {
      axios
        .post("/emailexists", { email: this.email.value })
        .then((response) => {
          if (response.data) {
            this.email.isUnique = false;
            this.showerror(this.email, "The email is already Exist");
          } else {
            this.email.isUnique = true;
            this.hideValidater(this.email);
          }
        })
        .catch(() => {
          console.log("try again");
        });
    }
  }
  insertvalidation() {
    this.allfield.forEach((ele) => {
      ele.insertAdjacentHTML(
        "afterend",
        `<div class="alert alert-danger small liveValidateMessage "></div>`
      );
    });
  }
}
