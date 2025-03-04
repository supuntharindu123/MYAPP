const validator = require("validator");
const bcrypt = require("bcryptjs");
const userdb = require("../db").db().collection("users");
const md5 = require("md5");
const ObjectID = require("mongodb").ObjectId;

let User = function (data, getAvatar) {
  this.data = data;
  this.errors = [];
  if (getAvatar == undefined) {
    getAvatar = false;
  }
  if (getAvatar) {
    this.getAvatar();
  }
};

User.prototype.cleanup = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = async function () {
  if (this.data.username == "") {
    this.errors.push("You must provide a username");
  }
  if (this.data.username != "" && !/^[a-zA-Z0-9 ]+$/.test(this.data.username)) {
    this.errors.push(
      "username can only contain characters, numbers and spaces"
    );
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a valid email address");
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password");
  }
  if (this.data.password.length < 8) {
    this.errors.push("Password must be at least 8 characters long");
  }

  if (
    this.data.username &&
    this.data.username.length > 3 &&
    this.data.username.length < 31
  ) {
    let existusername = await userdb.findOne({
      username: this.data.username,
    });
    if (existusername) {
      this.errors.push("Username already exists.");
    }
  }
  if (validator.isEmail(this.data.email)) {
    let existemail = await userdb.findOne({ email: this.data.email });
    if (existemail) {
      this.errors.push("Email already exists");
    }
  }
};

User.prototype.login = async function () {
  return new Promise(async (resolve, reject) => {
    this.cleanup();
    const attemptuser = await userdb.findOne({ username: this.data.username });

    if (
      attemptuser &&
      bcrypt.compareSync(this.data.password, attemptuser.password)
    ) {
      this.data = attemptuser;
      this.getAvatar();
      resolve("login successful");
    } else {
      reject("Invalid password or Username");
    }
  });
};

User.prototype.register = async function () {
  return new Promise(async (resolve, reject) => {
    this.cleanup();
    await this.validate();

    if (!this.errors.length) {
      let hashpwd = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, hashpwd);
      this.getAvatar();
      await userdb.insertOne(this.data);

      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

User.findByUsername = function (username) {
  return new Promise(async (resolve, reject) => {
    if (typeof username != "string") {
      reject();
      return;
    }

    await userdb
      .findOne({ username: username })
      .then((userDoc) => {
        if (userDoc) {
          // console.log("findByUsernamehelo", username);
          userDoc = new User(userDoc, true);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            avatar: userDoc.avatar,
          };

          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function () {
        reject();
      });
  });
};

User.emailexist = function (email) {
  return new Promise(async function (resolve, reject) {
    if (typeof email !== "string") {
      resolve(false);
      return;
    }
    let user = await userdb.findOne({ email: email });

    if (user) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

User.usernameexist = function (username) {
  return new Promise(async function (resolve, reject) {
    if (typeof username !== "string") {
      resolve(false);
      return;
    }
    let user = await userdb.findOne({ username: username });

    if (user) {
      resolve(true);
    } else {
      resolve(false);
    }
    console.log(`user`, user);
  });
};

User.profiledetails = async function (id) {
  try {
    const user = await userdb.findOne({ _id: new ObjectID(id) });
    if (user) {
      return user;
    } else {
      return "cannot find user";
    }
  } catch (err) {
    console.log("error fetching profile details", err);
    return err;
  }
};

module.exports = User;
