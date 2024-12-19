const postDB = require("../db").db().collection("post");
const followDB = require("../db").db().collection("follow");
const ObjectID = require("mongodb").ObjectId;
const User = require("./User");
const sanitizehtml = require("sanitize-html");

let Post = function (data, userId, requestedpostId) {
  this.data = data;
  this.errors = [];
  this.userId = userId;
  this.requestedpostId = requestedpostId;
};

Post.prototype.cleanup = function () {
  if (typeof this.data.title != "string") this.data.title = "";
  if (typeof this.data.content != "string") this.data.content = "";

  this.data = {
    title: sanitizehtml(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    content: sanitizehtml(this.data.content.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    createdDate: new Date(),
    author: new ObjectID(this.userId),
  };
};

Post.prototype.validate = function () {
  if (!this.data.title) this.errors.push("Title is required.");
  if (!this.data.content) this.errors.push("Content is required.");
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanup();
    this.validate();

    if (!this.errors.length) {
      postDB
        .insertOne(this.data)
        .then((info) => resolve(info.insertedId))
        .catch((err) => {
          console.error("Database error:", err);
          this.errors.push("Failed to create post.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.ReusablePostQuery = function (
  uniqueoperations,
  visitorId,
  finaloperations = []
) {
  return new Promise(async (resolve, reject) => {
    let aggOperations = uniqueoperations
      .concat([
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDocument",
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            createdDate: 1,
            authorId: "$author",
            author: { $arrayElemAt: ["$authorDocument", 0] },
          },
        },
      ])
      .concat(finaloperations);
    let posts = await postDB.aggregate(aggOperations).toArray();

    posts = posts.map(function (post) {
      post.isVisitorOwner = post.authorId === visitorId;

      post.authorId = undefined;
      post.author = {
        username: post.author.username || "",
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async (resolve, reject) => {
    console.log("Received ID:", id);
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
    }
    let posts = await Post.ReusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );
    console.log(posts);
    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.ReusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanup();
    this.validate();

    if (!this.errors.length) {
      await postDB.findOneAndUpdate(
        { _id: new ObjectID(this.requestedpostId) },
        { $set: { title: this.data.title, content: this.data.content } }
      );
      resolve("success");
    } else {
      resolve("failure");
    }
  });
};

Post.prototype.updatepost = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedpostId, this.userId);
      if (post.isVisitorOwner) {
        let status = await this.actuallyUpdate();
        resolve(status);
      }
    } catch {
      reject("You are not authorized to edit this post");
    }
  });
};

Post.deletePost = function (deleteId, userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(deleteId, userid);

      if (post.isVisitorOwner) {
        console.log(`posr`, post);
        await postDB.deleteOne({ _id: new ObjectID(deleteId) });
        resolve();
      } else {
        reject();
        console.log("error deleting");
      }
    } catch {
      reject("You are not authorized to delete this post");
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let posts = await Post.ReusablePostQuery(
        [{ $match: { $text: { $search: searchTerm } } }],
        undefined,
        [{ $sort: { score: { $meta: "textScore" } } }]
      );
      resolve(posts);
    } else {
      reject();
    }
  });
};

Post.countpost = function (id) {
  return new Promise(async (resolve, reject) => {
    let postcount = await postDB.countDocuments({ author: id });
    resolve(postcount);
  });
};

Post.getFeed = function (id) {
  return new Promise(async (resolve, reject) => {
    let followuser = await followDB
      .find({ authorId: new ObjectID(id) })
      .toArray();

    followuser = followuser.map(function (follow) {
      return follow.followId;
    });
    let post = await Post.ReusablePostQuery([
      { $match: { author: { $in: followuser } } },
      { $sort: { createdDate: -1 } },
    ]);
    console.log(post);
    resolve(post);
  });
};

module.exports = Post;
