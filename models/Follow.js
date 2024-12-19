const ObjectID = require("mongodb").ObjectId;

const userDB = require("../db").db().collection("users");
const followDB = require("../db").db().collection("follow");
const User = require("./User");

let Follow = function (followusername, authorId) {
  this.followusername = followusername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanup = async function () {
  if (typeof this.followusername != "string") {
    this.followusername = "";
  }
};
Follow.prototype.validate = async function (action) {
  let followAccount = await userDB.findOne({ username: this.followusername });
  if (followAccount) {
    this.followId = followAccount._id;
  } else {
    this.errors.push("User not found");
  }

  let followalready = await followDB.findOne({
    followId: this.followId,
    authorId: new ObjectID(this.authorId),
  });
  if (action == "create") {
    if (followalready) {
      this.errors.push("You are already followed");
    }
  }

  if (action == "delete") {
    if (!followalready) {
      this.errors.push("You cannot unfollowed");
    }
  }

  if (this.followId.equals(this.authorId)) {
    this.errors.push("You cannot follow yourself");
  }
};

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanup();
    await this.validate("create");

    if (!this.errors.length) {
      const result = await followDB.insertOne({
        followId: this.followId,
        authorId: new ObjectID(this.authorId),
      });

      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanup();
    await this.validate("delete");

    if (!this.errors.length) {
      const result = await followDB.deleteOne({
        followId: this.followId,
        authorId: new ObjectID(this.authorId),
      });

      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function (followdId, visitorId) {
  let followDoc = await followDB.findOne({
    followId: followdId,
    authorId: new ObjectID(visitorId),
  });
  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

Follow.getFollowerbyId = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followDB
        .aggregate([
          { $match: { followId: id } },
          {
            $lookup: {
              from: "users",
              localField: "authorId",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $project: {
              username: { $arrayElemAt: ["$userDoc.username", 0] },
              email: { $arrayElemAt: ["$userDoc.email", 0] },
            },
          },
        ])
        .toArray();
      console.log(followers);
      followers = followers.map((follower) => {
        let user = new User(follower, true);
        console.log(user);
        return { username: follower.username, avatar: user.avatar };
      });

      resolve(followers);
    } catch {
      reject("Error fetching followers");
    }
  });
};

Follow.getFollowingbyId = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followDB
        .aggregate([
          { $match: { authorId: id } },
          {
            $lookup: {
              from: "users",
              localField: "followId",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $project: {
              username: { $arrayElemAt: ["$userDoc.username", 0] },
              email: { $arrayElemAt: ["$userDoc.email", 0] },
            },
          },
        ])
        .toArray();
      console.log(followers);
      followers = followers.map((follower) => {
        let user = new User(follower, true);
        console.log(user);
        return { username: follower.username, avatar: user.avatar };
      });

      resolve(followers);
    } catch {
      reject("Error fetching followers");
    }
  });
};

Follow.countfollowers = function (id) {
  return new Promise(async (resolve, reject) => {
    let followercount = await followDB.countDocuments({ followId: id });
    resolve(followercount);
  });
};

Follow.countfollowing = function (id) {
  return new Promise(async (resolve, reject) => {
    let followingcount = await followDB.countDocuments({ authorId: id });
    resolve(followingcount);
  });
};

module.exports = Follow;
