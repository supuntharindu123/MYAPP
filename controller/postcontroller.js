const Post = require("../models/Post");

exports.postcreate = function (req, res) {
  res.render("create-post");
};

exports.singlepost = async function (req, res) {
  try {
    console.log(req.params.id);
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    console.log(post.title);
    res.render("single-post", { post: post });
  } catch {
    res.render("404");
  }
};

exports.create = function (req, res) {
  console.log(req.session.user._id);
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function (id) {
      req.flash("success", "Successfully Post created");
      req.session.save(() => res.redirect(`/post/${id}`));
    })
    .catch(function (err) {
      err.forEach((e) => req.flash("error", e));
      req.session.save(() => res.redirect("/create-post"));
    });
};

exports.editViewScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);
    console.log(post);
    if ((post.authorId = req.visitorId)) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You don't have permission to perform this action");
      req.session.save(function () {
        console.log("You don't have permission to perform this action");
        res.redirect("/");
      });
    }
  } catch {
    res.render("404");
  }
};

exports.editPost = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .updatepost()
    .then((status) => {
      if (status === "success") {
        req.flash("success", "post updated successfully");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}`);
        });
      } else {
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
        req.session.save(function () {
          res.redirect("/post/${req.params.id}/edit");
        });
      }
    })
    .catch((e) => {
      console.log(e);
      req.flash("errors", "You donot have permission to perform this action");
      req.session.save(function () {
        console.log("You don't have permission to perform this action");
        res.redirect("/");
      });
    });
};

exports.deleteOnePost = function (req, res) {
  Post.deletePost(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post deleted successfully");
      req.session.save(() =>
        res.redirect(`/profile/${req.session.user.username}`)
      );
    })
    .catch(() => {
      req.flash("errors", "You don't have permission to perform this action");
      req.session.save(() => res.redirect("/"));
    });
};

exports.search = function (req, res) {
  Post.search(req.body.searchTerm)
    .then((post) => {
      res.json(post);
    })
    .catch(() => {
      res.json();
    });
};
