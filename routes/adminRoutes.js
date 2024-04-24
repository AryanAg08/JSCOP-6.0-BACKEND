const router = require("express").Router();
const catchAsync = require("../utils/CatchAsync");
const admin = require("../controllers/adminController.js");
const { isAdmin, checkUser, isVolunteer } = require("../middleware.js");
const ticket = require("../controllers/qrController.js");

router.route("/login").post(catchAsync(admin.adminlogin));

router.route("/logout").get(catchAsync(admin.adminlogout));

router
    .route("/allUsers")
    .get(catchAsync(isAdmin), catchAsync(admin.getAllUsers));

router
    .route("/user/:id")
    .get(catchAsync(isAdmin), catchAsync(admin.getUser))
    .delete(catchAsync(isAdmin), catchAsync(admin.deleteUser))
    .put(catchAsync(isAdmin), admin.updateUser);

// (same delete as above)
// router.route('/delete/:id')
//     .delete(isAdmin, catchAsync(admin.deleteUser));

router.route("/search/:name").get(catchAsync(isAdmin), catchAsync(admin.searchUser));
//this is by name only further we can do by email or enrollment number

//to verify the users
router.route("/verify/:userid").get(catchAsync(isAdmin), catchAsync(admin.verifyUser));

router.route("/unverified").get(catchAsync(isAdmin), admin.unverifiedUser);

router.route("/verified").get(catchAsync(isAdmin), admin.verifiedUser);

router.route("/getUser/:qrId")
    .get(checkUser, catchAsync(admin.findUserByQrId));

router
    .route("/sendTicket/:userid")
    .post(catchAsync(isAdmin), catchAsync(ticket.generateQRCode));

router
    .route("/sendTicketafterVerification/:userid")
    .post(catchAsync(isAdmin), catchAsync(ticket.sendQrCodeThroughEmail));

router
    .route("/verifyTicket/:ticketid")
    .post(checkUser, catchAsync(admin.validateTicket));

module.exports = router;
