const router = require("express").Router();
const userController = require("../controllers/userController");
const {verifyTokenAndAuthorization, verifyAdmin}= require("../middlewares/verifyToken")


// UPADATE USER
router.put("/",verifyTokenAndAuthorization, userController.updateUser);

router.get("/verify/:otp",verifyTokenAndAuthorization, userController.verifyAccount);
router.get("/customer_service", userController.getAdminNumber);
router.post("/feedback",verifyTokenAndAuthorization, userController.userFeedback)
router.get("/verify_phone/:phone",verifyTokenAndAuthorization, userController.verifyPhone);

// DELETE USER

router.delete("/" , verifyTokenAndAuthorization, userController.deleteUser);

// GET USER

router.get("/",verifyTokenAndAuthorization, userController.getUser);

router.put("/updateToken/:token",verifyTokenAndAuthorization, userController.updateFcm);

// Add Skills
router.get("/get-all-users", userController.getAllUsersMessage);

router.get("/get-all-restaurants", userController.getAllRestaurants);

router.post("/update-profile-res", userController.updateProfileRestaurants);

router.get("/get-profile-res/:id", userController.getProfileRestaurants);

router.post("/update-profile-cus", userController.updateProfileCus);

router.get("/get-profile-cus/:id", userController.getProfileCustomer);

router.post("/update-profile-driver", userController.updateProfileDriver);

router.get("/get-profile-driver/:id", userController.getProfileDriver);

module.exports = router