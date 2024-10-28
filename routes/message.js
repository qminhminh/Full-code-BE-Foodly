const router = require("express").Router();
const messageController = require("../controllers/messageController");


// REGISTRATION 

router.get("/messages/:restaurantId/:customerId", messageController.getAllMessages);


module.exports = router