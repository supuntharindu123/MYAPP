async function navigateTo(url) {
  const mypromise = await fetch(url);

  const mydata = await mypromise.text();

  const ourParser = new DOMParser();

  const ourdoc = ourParser.parseFromString(mydata, "text/html");

  document.title = ourdoc.title;
  document.querySelector(".container-narrow").innerHTML =
    ourdoc.querySelector(".container-narrow").innerHTML;
}

async function spaCreatePost(data, e) {
  const serverresponse = await fetch(e.target.action, {
    method: "POST",
    body: data,
  });
  const serverinfo = await serverresponse.text();
  const ourParser = new DOMParser();
  console.log("ourParser", ourParser);
  const ourdoc = ourParser.parseFromString(serverinfo, "text/html");
  console.log("ourdoc", ourdoc);
  document.title = ourdoc.title;
  document.querySelector(".container-narrow").innerHTML =
    ourdoc.querySelector(".container-narrow").innerHTML;

  const thenewId = ourdoc.querySelector("#post-id").dataset.id;
  const newpostpath = `/post/${thenewId}`;

  history.pushState(newpostpath, null, newpostpath);
}

async function spaEditPost(data, e) {
  const serverresponse = await fetch(e.target.action, {
    method: "POST",
    body: data,
  });
  const serverinfo = await serverresponse.text();
  const ourParser = new DOMParser();
  console.log("ourParser", ourParser);
  const ourdoc = ourParser.parseFromString(serverinfo, "text/html");
  console.log("ourdoc", ourdoc);
  document.title = ourdoc.title;
  document.querySelector(".container-narrow").innerHTML =
    ourdoc.querySelector(".container-narrow").innerHTML;
}

async function spaDeletePost(data, e) {
  console.log("spaDeletePost", e.target.action);
  const serverResponse = await fetch(e.target.action, {
    method: "POST",
    body: data,
  });

  const serverInfo = await serverResponse.text();
  console.log(`serverInfo`, serverInfo);
  const ourParser = new DOMParser();
  const ourDoc = ourParser.parseFromString(serverInfo, "text/html");

  const nextURL = document.querySelector("#user-link").href;
  history.pushState(nextURL, null, nextURL);

  document.title = ourDoc.title;
  document.querySelector(".container-narrow").innerHTML =
    ourDoc.querySelector(".container-narrow").innerHTML;
}

async function spaLikePost(data, e) {
  console.log("spalike", e.target.action);
  const serverResponse = await fetch(e.target.action, {
    method: "POST",
    body: data,
  });

  const serverInfo = await serverResponse.text();
  console.log(`serverInfo`, serverInfo);
  const ourParser = new DOMParser();
  const ourDoc = ourParser.parseFromString(serverInfo, "text/html");

  // const nextURL = document.querySelector("#user-link").href;
  // history.pushState(nextURL, null, nextURL);

  document.title = ourDoc.title;
  document.querySelector(".container-narrow").innerHTML =
    ourDoc.querySelector(".container-narrow").innerHTML;
}

function same(a, b) {
  const urlA = new URL(a);
  const urlB = new URL(b);
  return urlA.origin === urlB.origin;
}

export default function () {
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      if (same(e.target.href, window.location)) {
        console.log("click");
        e.preventDefault();
        history.pushState(e.target.href, null, e.target.href);
        navigateTo(e.target.href);
      }
    }
  });
  window.addEventListener("popstate", function (e) {
    navigateTo(e.state);
  });
  document.addEventListener("submit", function (e) {
    if (e.target.classList.contains("spa-form")) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = new URLSearchParams();
      for (const pair of formData) {
        data.append(pair[0], pair[1]);
      }
      if (e.target.classList.contains("create-post-form")) {
        spaCreatePost(data, e);
      }

      if (e.target.classList.contains("edit-post-form")) {
        spaEditPost(data, e);
      }

      if (e.target.classList.contains("delete-post-form")) {
        spaDeletePost(data, e);
      }
      if (e.target.classList.contains("like-form")) {
        spaLikePost(data, e);
      }
    }
  });
}
