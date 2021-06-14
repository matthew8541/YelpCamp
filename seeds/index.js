const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
 
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser    : true,
    useCreateIndex     : true,
    useUnifiedTopology : true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// return a random item from the input array
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: "60c0a0d115b11400153bbe4d",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ytseng35/image/upload/v1622743433/YelpCamp/wz8lvr3m0kk4xtdgahua.jpg',
                    filename: 'YelpCamp/wz8lvr3m0kk4xtdgahua'
                },
                {
                    url: 'https://res.cloudinary.com/ytseng35/image/upload/v1622743435/YelpCamp/oxmukahvstdorjs0ydlz.jpg',
                    filename: 'YelpCamp/oxmukahvstdorjs0ydlz'
                },
                {
                    url: 'https://res.cloudinary.com/ytseng35/image/upload/v1622743436/YelpCamp/neir1fjzycqmts5xnmqr.jpg',
                    filename: 'YelpCamp/neir1fjzycqmts5xnmqr'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log("Mongoose Closed (SeedDB)")
    mongoose.connection.close();
})