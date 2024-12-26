const Like = require("../models/Like");
const Post = require("../models/Post");

exports.addlike = async function (req, res) {
  console.log("Adding", req.params.id);
  const postId = req.params.id;
  console.log("user", req.session.user.username);

  try {
    const postId = req.params.id;

    const loguser = req.session.user.username;

    let like = new Like(postId, loguser);
    let response = await like.addLikes();
    res.send("add Like");
  } catch (err) {
    console.log(err);
  }
};
