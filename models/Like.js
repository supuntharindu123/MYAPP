const ObjectID = require("mongodb").ObjectId;

const userDB = require("../db").db().collection("users");
const followDB = require("../db").db().collection("follow");
const likeDB = require("../db").db().collection("like");
const postDB = require("../db").db().collection("post");
const Post = require("./Post");
const User = require("./User");

let Like = function (postId, authorname) {
  this.postId = postId;
  this.authorname = authorname;
  this.errors = [];
};

Like.prototype.validate = function () {
  if (!this.postId || !this.authorname) {
    this.errors.push("postId and authorname are required");
  }
};

Like.prototype.addLikes = async function () {
  this.validate();
  if (this.errors.length) {
    return { success: false, errors: this.errors };
  }
  try {
    const response = await likeDB.insertOne({
      PostId: new ObjectID(this.postId),
      LikedUser: this.authorname,
    });
    if (response) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    return { success: false, errors: err };
  }
};

// Like.prototype.likeAndpost = async function () {
//   try {
//     let likepost = await postDB.aggregate([
//       {
//         $lookup: {
//           from: "like",
//           localField: "PostId",
//           foreignField: "_id",
//           as: "authorDocument",
//         },
//       },
//       {
//         $project: {
//           title: 1,
//           content: 1,
//           createdDate: 1,
//           authorId: "$author",
//           author: { $arrayElemAt: ["$authorDocument", 0] },
//         },
//       },
//     ]);
//   } catch (err) {}
// };

// Like.getLikes = async function () {
//   try {
//     let response = await likeDB.find();
//     response = response.map((res) => {
//       console.log(`res`, res);
//       return res;
//     });

//     return response;
//   } catch (err) {
//     return err;
//   }
// };

Like.prototype.disLike = async function (postId, likeduser) {
  try {
    let response = await likeDB.deleteOne({
      PostId: new ObjectID(postId),
      LikedUser: likeduser,
    });
    console.log(`response`, response);
    if (response.deletedCount > 0) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    return { success: false, error: err };
  }
};

module.exports = Like;
