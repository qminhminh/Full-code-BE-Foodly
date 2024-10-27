const Rating = require('../models/Rating')
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Driver = require('../models/Driver');
module.exports = {
    addRating: async (req, res) => {
        const newRating = new Rating({
            userId: req.user.id,
            ratingType: req.body.ratingType,
            product: req.body.product,
            rating: req.body.rating,
            comment: req.body.comment
        });
    
        try {
             await newRating.save();
    
            if (req.body.ratingType === 'Restaurant') {
                const restaurants = await Rating.aggregate([
                    { $match: { ratingType: 'Restaurant', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (restaurants.length > 0) {
                    const averageRating = restaurants[0].averageRating;
                    await Restaurant.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            } else if (req.body.ratingType === 'Driver') {
                const driver = await Rating.aggregate([
                    { $match: { ratingType: 'Driver', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (driver.length > 0) {
                    const averageRating = driver[0].averageRating;
                    await Driver.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            } else if (req.body.ratingType === 'Food') {
                const food = await Rating.aggregate([
                    { $match: { ratingType: 'Food', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (food.length > 0) {
                    const averageRating = food[0].averageRating;
                    await Food.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            }
    
            res.status(200).json({status: true, message: 'Rating added successfully'});
        } catch (error) {
            res.status(500).json({status: false, message: error.message});
        }
    },


     checkIfUserRatedRestaurant: async (req, res) => {
        const ratingType = req.query.ratingType;
        const product = req.query.product;

        try {
            const ratingExists = await Rating.findOne({
                userId: req.user.id,
                product: product,
                ratingType: ratingType
            });
    
            if (ratingExists) {
                return res.status(200).json({ status: true, message: "You have already rated this restaurant." });
            } else {
                return res.status(200).json({ status: false, message: "User has not rated this restaurant yet." });
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
    getAllReviews: async (req, res) => {
        const id = req.params.id;
        try {
            const reviews = await Rating.find({ product: id });
            res.status(200).json({ status: true, reviews });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
    
}