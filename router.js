const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const usercontrol = require("./controller/usercontroller");
const postcontrol = require("./controller/postcontroller");
const followcontrol = require("./controller/followcontroller");
const likecontrol = require("./controller/likecontroller");

router.get("/", usercontrol.home);
router.post("/register", usercontrol.register);
router.post("/login", usercontrol.login);
router.post("/logout", usercontrol.logout);
router.post("/usernameexist", usercontrol.usernameexists);
router.post("/emailexists", usercontrol.emailexists);
router.get("/create-post", usercontrol.usermustloggin, postcontrol.postcreate);
router.post(
  "/create-post",
  usercontrol.usermustloggin,
  upload.single("file"),
  postcontrol.create
);
router.get("/post/:id", postcontrol.singlepost);
router.get(
  "/profile/:username",
  usercontrol.ifuserexists,
  usercontrol.shareddata,
  usercontrol.profile
);
router.get(
  "/profile/:username/followers",
  usercontrol.ifuserexists,
  usercontrol.shareddata,
  usercontrol.profilefollowers
);
router.get(
  "/profile/:username/following",
  usercontrol.ifuserexists,
  usercontrol.shareddata,
  usercontrol.profilefollowings
);
router.get(
  "/post/:id/edit",
  usercontrol.usermustloggin,
  postcontrol.editViewScreen
);

router.post("/post/:id/edit", usercontrol.usermustloggin, postcontrol.editPost);
router.post(
  "/post/:id/delete",
  usercontrol.usermustloggin,
  postcontrol.deleteOnePost
);
router.post("/search", postcontrol.search);
router.post(
  "/addfollow/:username",
  usercontrol.usermustloggin,
  followcontrol.addFollow
);
router.post(
  "/removefollow/:username",
  usercontrol.usermustloggin,
  followcontrol.removeFollow
);

router.post("/post/:id/like", usercontrol.usermustloggin, usercontrol.home);
router.post("/post/:id/likes", postcontrol.singlepost);

router.post(
  "/post/:id/dislike",
  usercontrol.usermustloggin,
  usercontrol.home01
);

router.post("/post/:id/dislikes", postcontrol.singlepost01);

router.get("/edit", usercontrol.usermustloggin, usercontrol.viewprofileedit);

module.exports = router;
