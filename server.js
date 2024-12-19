const express = require("express");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const flash = require("connect-flash");
const router = require("./router");
const markdown = require("marked");
const sanitizehtml = require("sanitize-html");
const app = express();

let sessionoption = session({
  secret: "secret",
  store: mongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: "strict" },
});

app.use(sessionoption);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.filterHtml = function (context) {
    return sanitizehtml(markdown.parse(context), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "li",
        "strong",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "i",
        "bold",
        "italic",
      ],
      allowedAttributes: {},
    });
  };
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  res.locals.user = req.session.user;
  next();
});

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

const server = require("http").createServer(app);

const io = require("socket.io")(server);

io.use(function (socket, next) {
  sessionoption(socket.request, socket.request, next);
});

io.on("connection", function (socket) {
  if (socket.request.session.user) {
    let user = socket.request.session.user;

    socket.emit("welcome", { username: user.username, avatar: user.avatar });
    socket.on("send", function (data) {
      socket.broadcast.emit("sendfromserver", {
        message: sanitizehtml(data.message, {
          allowedTags: [],
          allowedAttributes: [],
        }),
        username: user.username,
        avatar: user.avatar,
      });
    });
  }
});

module.exports = server;
