const router = require("express").Router();
const ratingController = require("../controllers/ratingController");
const {verifyTokenAndAuthorization}= require("../middlewares/verifyToken")

// UPADATE USER
router.post("/",verifyTokenAndAuthorization, ratingController.addRating);
router.get("/",verifyTokenAndAuthorization, ratingController.checkIfUserRatedRestaurant);

router.get("/get-all-review/:id", ratingController.getAllReviews);


module.exports = router;