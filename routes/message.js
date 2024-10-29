const router = require("express").Router();
const messageController = require("../controllers/messageController");


// REGISTRATION 

router.get("/messages/:restaurantId/:customerId", messageController.getAllMessages);
router.get("/get-users-messages/:restaurantId", messageController.getAllGetUsersMessages);

module.exports = router