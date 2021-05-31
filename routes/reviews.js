const express = require("express");
// /campgrounds/:id/reviews --> we need the access to the :id in the prefix routes
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressError');
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // if no error, pass it to the next route handler
    next()
  }
}

router.post("/", validateReview, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/:reviewId", catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findOneAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;