const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

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
  if (req.session.user) {
    console.log(req.session.user._id);
    let posts = await Post.getFeed(req.session.user._id);
    // console.log(posts);
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
      res.render("profile", {
        count: {
          postcount: req.postcount,
          followerscount: req.followerscount,
          followingcount: req.followingcount,
        },
        posts: posts,
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

  //get counts
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
    console.log(e);
    res.render("404");
  }
};
