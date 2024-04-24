const qrCode = require("../models/qrCodeModel");
const User = require("../models/adminModel");
const generalUsers = require("../models/userModel");
const sendMail = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.adminlogin = async (req, res) => {
    console.log("Admin Login");
    let { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) res.status(400).json("missing fields");
    else {
        email = email.toLowerCase();
        const user = await User.findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id }, `${process.env.SECRET}`, {
                expiresIn: "5h",
            });
            res.cookie("jwt", token, { 
                signed: true, 
                maxAge: 1000 * 60 * 60,
                secure:true,
                sameSite:'none',
                httpOnly: true,
            });
            res.status(200).json({ ...user.toObject(), jwt: token });
        } else {
            res.status(400).json("login failed");
        }
    }
};

module.exports.adminlogout = (req, res) => {
    res.clearCookie("jwt").json("logout");
};

module.exports.getAllUsers = async (req, res) => {
    console.log("hello world");
    const users = await generalUsers.find({});
    console.log(users);
    res.json(users);
};

module.exports.getUser = async (req, res) => {
    const { id } = req.params;
    const user = await generalUsers.findById(id);
    res.json(user);
};

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await generalUsers.findByIdAndDelete(id);
    res.json("User Deleted");
};

module.exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, department, phone, branch } = req.body;
    const user = await generalUsers.findByIdAndUpdate(id, {
        name: name,
        email: email,
        department: department,
        phoneNo: phone,
        branch: branch,
        
    });
    
    if (!user) {
        return res.status(400).json("user not found");
    }
    res.json("user updated");
};


module.exports.findUserByQrId = async (req,res) => {
    console.log("hello world");
    const {qrId} = req.params;
    const userQr = await qrCode.findOne({qr_id: qrId});
    console.log(userQr);
    const user = await generalUsers.findById(userQr.user);
    res.json(user);
}


module.exports.searchUser = async (req, res) => {
    const { name } = req.params;
    const user = await generalUsers.findOne({ name: name });
    res.json(user);
};

//This verifies the unverified user
module.exports.verifyUser = async (req, res) => {
    const { userid } = req.params;
    let user = await generalUsers.findById(userid);
    if (!user) {
        return res.status(400).json("user not found");
    } else {
        user = await generalUsers.findByIdAndUpdate(userid, {
            verified: true,
        });
        // console.log(user)
        console.log("after save")
        res.status(200).json("User Verified");
    }
};

// this returns all the unverfied users
module.exports.unverifiedUser = async (req, res) => {
    const unverifedUser = generalUsers.find({ verified: false });
    res.status(200).send(unverifedUser);
};

module.exports.verifiedUser = async (req, res) => {
    const verifedUser = generalUsers.find({ verified: true });
    res.status(200).send(verifedUser);
};

// Ticket Validation
module.exports.validateTicket = async (req, res) => {
    const { ticketid } = req.params;
    const ticketFound = await qrCode.findOne({ qr_id: ticketid });

    if (!ticketFound) {
        return res.status(400).json({
            success: false,
            message: "Invalid Ticket ID",
        });
    }

    if (ticketFound.redeemed_count >= 1) {
        return res.status(400).json({
            success: false,
            message: "Ticket already redeemed",
        });
    }

    if (Date.now() - ticketFound.reedeemed_timestamp < 18 * 60 * 60 * 1000) {
        return res.status(400).json({
            success: false,
            message: "Ticket cannot be redeemed before 18 hours",
        });
    }

    const user = await ticketFound.populate("user");

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found",
        });
    }

    const email = user.user.email;

    const qrCodeUser = await qrCode.findOne({ user: user.user._id });
    if (!qrCodeUser) {
        return res.status(400).send("User does not have a QR Code");
    }

    if (qrCodeUser.redeemed_count >= 1) {
        return res.status(400).send("Ticket already redeemed");
    }

    qrCodeUser.redeemed_count += 1;
    qrCodeUser.reedeemed_timestamp = Date.now();
    await qrCodeUser.save();

    sendMail(
        email,
        "Ticket Validated",
        `Your ticket has been validated successfully and redeemed ${qrCodeUser.redeemed_count} times.`
    );
    res.json("Ticket validated successfully");
};

// module.exports.adminregister = async (req, res) => {
//     let { username, email, password } = req.body;
//     email = email.toLowerCase();
//     const registeredEmail = await User.findOne({email: email});

//     if(registeredEmail){
//         res.status(400).json('email already exists');
//     }

//     else{
//         const salt = bcrypt.genSaltSync(10);
//         const hash = bcrypt.hashSync(password, salt);
//         const user = await User.create({username, email, password: hash});
//         res.json('register');
//     }
// }
