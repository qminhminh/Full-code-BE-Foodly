const router = require("express").Router();
const voucherController = require("../controllers/voucherController");
const {verifyTokenAndAuthorization, verifyVendor}= require("../middlewares/verifyToken");

router.post("/",verifyVendor, voucherController.addVoucher);
router.get("/restaurant/get-all-vouchers/:id", voucherController.getAllVoucher);
router.put("/update/:id", verifyVendor, voucherController.updateVoucher);
router.delete("/delete/:id", verifyVendor, voucherController.deleteVoucher);

module.exports = router;