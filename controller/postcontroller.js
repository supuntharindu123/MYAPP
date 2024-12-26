const Post = require("../models/Post");
const Like = require("../models/Like");

exports.postcreate = function (req, res) {
  res.render("create-post");
};

exports.singlepost = async function (req, res) {
  try {
    const postId = req.params.id;

    const loguser = req.session.user.username;
    let like = new Like(postId, loguser);

    let post = await Post.findSingleById(req.params.id, req.visitorId);

    let posts = await Post.findByAuthorId(post.authorId);
    let response = await like.addLikes();

    res.render("single-post", { post: post, posts: posts });
  } catch {
    res.render("404");
  }
};

exports.singlepost01 = async function (req, res) {
  try {
    const postId = req.params.id;

    const loguser = req.session.user.username;
    let like = new Like(postId, loguser);
    let response = await like.disLike(postId, loguser);

    let post = await Post.findSingleById(req.params.id, req.visitorId);

    let posts = await Post.findByAuthorId(post.authorId);

    res.render("single-post", { post: post, posts: posts });
  } catch {
    res.render("404");
  }
};

exports.create = async function (req, res) {
  console.log(`file`, req.body.filename);
  let post = new Post(req.body, req.session.user._id);
  await post
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
