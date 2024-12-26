const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const Like = require("../models/Like");

exports.usernameexists = async function (req, res) {
  let usernameBool = await User.usernameexist(req.body.username);
  console.log(usernameBool);
  res.json(usernameBool);
};

exports.emailexists = async function (req, res) {
  let emailBool = await User.emailexist(req.body.email);
  res.json(emailBool);
};
exports.usermustloggin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to access this page");
    res.redirect("/");
  }
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((e) => {
      e.forEach((err) => {
        req.flash("registerError", err);
      });
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.home = async function (req, res) {
  try {
    if (req.session.user) {
      const postId = req.params.id;
      console.log("POST", postId);

      const loguser = req.session.user.username;

      let like = new Like(postId, loguser);

      let posts = await Post.getFeed(req.session.user._id);
      let response = await like.addLikes();
      console.log("success", posts);
      posts.forEach((post) => {
        if (post.like && post.like._id) {
          console.log("Post Like ID:", post.Likecount);
        } else {
          console.log("No like data for post:", post._id);
        }
      });

      res.render("home-logged", {
        posts: posts,
        username: req.session.user.username,
        avatar: req.session.user.avatar,
      });
    } else {
      res.render("home-guest", {
        errors: req.flash("errors"),
        registerError: req.flash("registerError"),
      });
    }
  } catch (e) {
    console.log("error", e);
  }
};

exports.home01 = async function (req, res) {
  try {
    if (req.session.user) {
      const postId = req.params.id;

      const loguser = req.session.user.username;

      let like = new Like(postId, loguser);
      let response = await like.disLike(postId, loguser);

      let posts = await Post.getFeed(req.session.user._id);
      console.log("success", posts);
      posts.forEach((post) => {
        if (post.like && post.like._id) {
          console.log("Post Like ID:", post.like.LikedUser);
        } else {
          console.log("No like data for post:", post._id);
        }
      });

      res.render("home-logged", {
        posts: posts,
        username: req.session.user.username,
        avatar: req.session.user.avatar,
      });
    } else {
      res.render("home-guest", {
        errors: req.flash("errors"),
        registerError: req.flash("registerError"),
      });
    }
  } catch (e) {
    console.log("error", e);
  }
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(() => {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id,
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((e) => {
      req.flash("errors", e);
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.ifuserexists = async function (req, res, next) {
  await User.findByUsername(req.params.username)
    .then(function (userDoc) {
      req.profileuser = userDoc;
      next();
    })
    .catch(function () {
      res.render("404");
    });
};
exports.profile = async function (req, res) {
  await Post.findByAuthorId(req.profileuser._id)
    .then(function (posts) {
      console.log(req.profileuser._id);
      res.render("profile", {
        count: {
          postcount: req.postcount,
          followerscount: req.followerscount,
          followingcount: req.followingcount,
        },
        posts: posts,
        profile: req.profileuser._id,
        profileusername: req.profileuser.username,
        profileavtar: req.profileuser.avatar,
        isfollowing: req.isfollowing,
        isvisitorprofile: req.isvisitorprofile,
      });
    })
    .catch(function () {
      res.render("404");
    });
};

exports.shareddata = async function (req, res, next) {
  let isvisitorprofile = false;
  let isfollowing = false;
  if (req.session.user) {
    isvisitorprofile = req.profileuser._id.equals(req.session.user._id);
    isfollowing = await Follow.isVisitorFollowing(
      req.profileuser._id,
      req.visitorId
    );
  }
  req.isvisitorprofile = isvisitorprofile;
  req.isfollowing = isfollowing;

  let postcounts = Post.countpost(req.profileuser._id);
  let followercounts = Follow.countfollowers(req.profileuser._id);
  let followingcounts = Follow.countfollowing(req.profileuser._id);

  let [postcount, followerscount, followingcount] = await Promise.all([
    postcounts,
    followercounts,
    followingcounts,
  ]);
  req.postcount = postcount;
  req.followerscount = followerscount;
  req.followingcount = followingcount;
  next();
};

exports.profilefollowers = async function (req, res) {
  try {
    let followers = await Follow.getFollowerbyId(req.profileuser._id);
    res.render("profile-followers", {
      count: {
        postcount: req.postcount,
        followerscount: req.followerscount,
        followingcount: req.followingcount,
      },

      followers: followers,
      profileusername: req.profileuser.username,
      profileavtar: req.profileuser.avatar,
      isfollowing: req.isfollowing,
      isvisitorprofile: req.isvisitorprofile,
    });
  } catch (e) {
    console.log(e);
    res.render("404");
  }
};

exports.profilefollowings = async function (req, res, next) {
  try {
    let following = await Follow.getFollowingbyId(req.profileuser._id);
    res.render("profile-following", {
      count: {
        postcount: req.postcount,
        followerscount: req.followerscount,
        followingcount: req.followingcount,
      },

      following: following,
      profileusername: req.profileuser.username,
      profileavtar: req.profileuser.avatar,
      isfollowing: req.isfollowing,
      isvisitorprofile: req.isvisitorprofile,
    });
  } catch (e) {
    res.render("404");
  }
};

exports.viewprofileedit = async function (req, res) {
  try {
    console.log(req.session.user._id);
    const userId = req.session.user._id;
    let data = await User.profiledetails(userId);
    console.log(data);
    res.render("edit-profile", {});
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};
