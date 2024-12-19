const express = require("express");
const router = express.Router();
const usercontrol = require("./controller/usercontroller");
const postcontrol = require("./controller/postcontroller");
const followcontrol = require("./controller/followcontroller");

router.get("/", usercontrol.home);
router.post("/register", usercontrol.register);
router.post("/login", usercontrol.login);
router.post("/logout", usercontrol.logout);
router.get("/create-post", usercontrol.usermustloggin, postcontrol.postcreate);
router.post("/create-post", usercontrol.usermustloggin, postcontrol.create);
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

module.exports = router;
