const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
})

// Needs to be placed before "/campgrounds/:id"
// Otherwise, the program will treat new as :id
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
})

// catchAsync: custom error function under utils folder
// Add a middleware: validateCampground
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
  // 400 -> Client Error
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
  const campground = new Campground(req.body.campground);
  // req.user is automatically implemented with passport
  campground.author = req.user._id
  await campground.save();
  req.flash("success", "Succesfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.get("/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "author" //populate the authors of the reviews
    }
  }).populate("author"); // populate the author of the campgrounds

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
}))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // prevent the other user to edit the posts of others
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
}))

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}))

module.exports = router;