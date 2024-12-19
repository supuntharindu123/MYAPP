import Dompurify from "dompurify";
export default class Chat {
  constructor() {
    this.openyet = false;
    this.chatwrapper = document.querySelector(".chat-wrapper");
    this.chatopen = document.querySelector(".chaticon");

    this.inject();
    this.chatlog = document.querySelector(".chat-log");
    this.chatfeild = document.querySelector(".chat-field");
    this.chatform = document.querySelector(".chat-form");
    this.closeicon = document.querySelector(".fa-times-circle");
    this.events();
  }

  events() {
    this.chatform.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendmessage();
    });
    this.chatopen.addEventListener("click", () => this.showchat());
    this.closeicon.addEventListener("click", () => this.hidechat());
  }

  sendmessage() {
    this.socket.emit("send", { message: this.chatfeild.value });
    this.chatlog.insertAdjacentHTML(
      "beforeend",
      Dompurify.sanitize(`<div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${this.chatfeild.value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny rounded-circle" src="${this.avatar} width="10">
      </div>`)
    );
    this.chatlog.scrollTop = this.chatlog.scrollHeight;
    this.chatfeild.value = "";
    this.chatfeild.focus();
  }
  showchat() {
    if (!this.openyet) {
      this.openConnection();
    }
    this.openyet = true;
    this.chatwrapper.classList.add("chat--visible");
    this.chatfeild.focus();
  }

  openConnection() {
    this.socket = io();
    this.socket.on("welcome", (data) => {
      this.username = data.username;
      this.avatar = data.avatar;
    });
    this.socket.on("sendfromserver", (data) => {
      this.displaymessage(data);
    });
  }

  displaymessage(data) {
    this.chatlog.insertAdjacentHTML(
      "beforeend",
      Dompurify.sanitize(`<div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny rounded-circle" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}</strong></a>
          ${data.message}
        </div></div>
      </div>`)
    );
    this.chatlog.scrollTop = this.chatlog.scrollHeight;
  }

  hidechat() {
    this.chatwrapper.classList.remove("chat--visible");
  }

  inject() {
    this.chatwrapper.innerHTML = `
    <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fa fa-times-circle"></i></span></div>
    
    <div id="chat" class="chat-log"></div>
      <form id="chatForm" class="chat-form border-top">
      <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
    </form>`;
  }
}
