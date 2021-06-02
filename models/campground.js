const mongoose = require("mongoose");
const { unsubscribe } = require("../routes/users");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampGroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
})

// If a post is removed, its reviews should be removed from Review schema
CampGroundSchema.post("findOneAndDelete", async function(doc) {
  if (doc) {
    await Review.remove({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model("Campground", CampGroundSchema);