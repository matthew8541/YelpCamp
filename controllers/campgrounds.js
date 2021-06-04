const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  // req.user is automatically implemented with passport
  campground.author = req.user._id
  await campground.save();
  req.flash("success", "Succesfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // prevent the other user to edit the posts of others
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  // spread the imgs in the argument 
  campground.images.push(...imgs);
  await campground.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    console.log(campground);
  }
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}