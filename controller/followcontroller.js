const Follow = require("../models/Follow");

exports.addFollow = function (req, res) {
  console.log(req.visitorId);
  let follow = new Follow(req.params.username, req.visitorId);
  follow
    .create()
    .then(() => {
      req.flash("success", `Successfully added ${req.params.username}`);
      req.session.save(() => res.redirect(`/profile/${req.params.username}`));
    })
    .catch((err) => {
      err.forEach((e) => {
        req.flash("errors", e);
      });
      req.session.save(() => res.redirect("/"));
    });
};

exports.removeFollow = function (req, res) {
  let follow = new Follow(req.params.username, req.visitorId);
  follow
    .delete()
    .then(() => {
      req.flash("success", `Successfully Unfollowed ${req.params.username}`);
      req.session.save(() => res.redirect(`/profile/${req.params.username}`));
    })
    .catch((err) => {
      err.forEach((e) => {
        req.flash("errors", e);
      });
      req.session.save(() => res.redirect("/"));
    });
};
