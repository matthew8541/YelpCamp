// npm packages
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");

// custom modules
const Campground = require("./models/campground");
const Review = require("./models/review");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require("./schemas")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection errer"));
db.once("open", () => {
  console.log("Database Connected!");
})

const app = express();

// ejsMate enable layouts boilerplate
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse the data from post method
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // if no error, pass it to the next route handler
    next()
  }
}

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // if no error, pass it to the next route handler
    next()
  }
}

app.get("/", (req, res) => {
  res.render("Home");
})

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
})

// Needs to appear before "/campgrounds/:id"
// Otherwise, the program will treat new as :id
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
})

// catchAsync: custom error function under utils folder
// Add a middleware: validateCampground
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
  // 400 -> Client Error
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate("reviews");
  res.render("campgrounds/show", { campground });
}))

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
}))

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}))

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`); 
}))

// catch all the invalid routes at the end
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not  Found", 404));
})

app.use((err, req, res, next) => {
  // default error and message 
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something went wrong!"
  res.status(statusCode).render("error", { err });
})

app.listen(3000, () => {
  console.log("Serving on port 3000");
})