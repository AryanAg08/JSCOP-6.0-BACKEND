const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const admin = require("./models/adminModel");
const Volunteer = require("./VolunteerData");
const e = require("express");

const isAdmin = async (req, res, next) => {
    console.log("Admin Check!!");
    const token1 = req.signedCookies.jwt;
    const token2 = req.header("Authorization")?.replace("Bearer ", "");
    const token = token1 || token2;
    if (token) {
        console.log("Token Found");
        const { id } = jwt.verify(token, `${process.env.SECRET}`);
        const Admin = await admin.find({ id });

        if (Admin) next();
        else res.status(400).json("not admin");
    } else {
        res.status(400).json("no token");
    }
};

const isVolunteer = async (req, res, next) => {
    console.log("Volunteer Check!!");
    const token = req.signedCookies.voljwt;
    if (token) {
        const decoded = jwt.verify(token, `${process.env.VOLSECRET}`);
        const volunteer = Volunteer.find(
            (volunteer) => volunteer.email === decoded.email
        );
        if (volunteer) next();
        else res.status(400).json("not volunteer");
    } else {
        res.status(400).json("no token");
    }
};

const checkUser = async (req, res, next) => {
    try {
        console.log("User Check!!");
        let isAdminUser = false;
        let isVolunteerUser = false;
        const token = req.signedCookies.jwt;
        const token2 = req.signedCookies.voljwt;

        console.log(token, token2);
        // Check if user is either an admin or a volunteer
        if(token) {
            console.log("Admin Check!!");   
            const { id } = jwt.verify(token, `${process.env.SECRET}`);
            const Admin = await admin.find({ id });
            if (Admin) isAdminUser = true;       
        }
        
        else if(token2) {
            console.log("Volunteer Check!!");
            const decoded = jwt.verify(token2, `${process.env.VOLSECRET}`);
            const volunteer = Volunteer.find(
                (volunteer) => volunteer.email === decoded.email
            )
            if (volunteer) isVolunteerUser = true;

        }
        else {
            return res.status(401).json({ error: "Unauthorized" });
        }
    
        // Allow access if either isAdmin or isVolunteer middleware passed
        if (isAdminUser || isVolunteerUser) {
            return next();
        } else {
            // If neither isAdmin nor isVolunteer middleware passed, send an error response
            return res.status(403).json({ error: "You are not authorized as an admin or a volunteer" });
        }
    } catch (err) {
        console.error("Error in checkUser middleware:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports.isAdmin = isAdmin;
module.exports.isVolunteer = isVolunteer;
module.exports.checkUser = checkUser;
