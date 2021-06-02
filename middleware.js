const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require('./utils/ExpressError');
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be signed in");
    return res.redirect("/login");
  };
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // if no error, pass it to the next route handler
    next()
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // prevent the other user to edit/delete the posts of others
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // if no error, pass it to the next route handler
    next()
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  // route: /campgrounds/:id/reviews/:reviewId
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  // prevent the other user to edit/delete the posts of others
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
