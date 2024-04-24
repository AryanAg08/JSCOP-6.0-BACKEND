const qrCode = require('../models/qrCodeModel');
const generalUsers = require('../models/userModel');
const sendMail = require('../utils/mailSender');
const jwt = require('jsonwebtoken');
const Data = require('../VolunteerData');



module.exports.volunteerLogin = async (req, res) => {
    console.log("Volunteer Login");
    let { email, password } = req.body;
    // console.log(req.body);
    if(!email || !password) res.status(400).json('missing fields');
    else{
        email = email.toLowerCase();
        const volunteer = Data.find(volunteer => volunteer.email === email);
        console.log(volunteer)
        if(volunteer && password === volunteer.password) {
            const token = jwt.sign({ email: volunteer.email }, `${process.env.VOLSECRET}`, { expiresIn: '5h' });
            res.cookie('voljwt', token, { signed: true, maxAge: 1000 * 60 * 60 });
            res.status(200).json(volunteer);
        }

        else{
            res.status(400).json('login failed');
        }

    }
}

module.exports.volunteerLogout = (req, res) => {
    res.clearCookie('jwt').json('logout');
}

