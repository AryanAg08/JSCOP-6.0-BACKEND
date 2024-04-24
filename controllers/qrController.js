const User = require("../models/userModel");
const qrCode = require("../models/qrCodeModel");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const tickettemPlate = require("../mail/templates/tickettemplate");
const hbs = require("nodemailer-express-handlebars");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

//creating ticket and sending it to Email
module.exports.generateQRCode = async (req, res) => {
    console.log("Inside Generate QR Code sending ticket")
    const { userid } = req.params;
    const user = await User.findById(userid);
    const { name, email } = user;
    const qr_id = uuidv4();
    if (!name || !email) {
        return res.status(400).send("Please enter all fields");
    }

    const userfound = await User.findOne({ email });
    const exisitingUser = await qrCode.findOne({ user: userfound._id });
    if (exisitingUser) {
        console.log("User already has a QR Code");
        return res.status(400).send("User already has a QR Code");
    }

    if (userfound) {
        console.log("User found");
        owner = userfound._id;
        const newQrCode = new qrCode({ user: owner, qr_id });
        await newQrCode.save();
        await sendTicket(email, qr_id);
        res.status(201).json("QR Code generated successfully");
    } else {
        res.status(400).send("User does not exist");
    }
};

module.exports.sendQrCodeThroughEmail = async (req, res) => {
    console.log("Inside Send Ticket After verification")
    const { userid } = req.params;
    const user = await User.findById(userid);
    const { email } = user;
    const qrCodeUser = await qrCode.findOne({ user: user._id });
    if (!qrCodeUser) {
        return res.status(400).send("User does not have a QR Code");
    }
    await sendTicket(email, qrCodeUser.qr_id);
    res.status(200).json("QR Code sent successfully");
};

const sendTicket = async (email, qr_id) => {
    console.log("Inside Send Ticket");

    

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: `${process.env.EMAIL}`,
            pass: `${process.env.PASSWORD}`,
        },
    });
    console.log("Transporter created");
    transporter.use(
        "compile",
        hbs({
          viewEngine: {
            extName: ".handlebars",
            partialsDir: "./controllers/template",
            defaultLayout: false,
          },
          viewPath: "./controllers/template",
          extName: ".handlebars",
        })
      );

      const finalqrid = `${qr_id}`;
    console.log("QR code Id: ",finalqrid);
    const qrCodeimg = await QRCode.toDataURL(finalqrid, {
        width: 400,
        margin: 2,
        color: {
            dark: "#335383FF",
            light: "#EEEEEEFF",
        },
    });
    console.log("QR Code generated Successfully!");
    const mailOptions = {
        from: `${process.env.EMAIL}`,
        to: `${email}`,
        subject: "JSCOP 6.0 Event Ticket", // subject
        template:"email",
        context: {
            title: "Event Confirmation",
            message: "Hello",
            imageUrl: "cid:unique@nodemailer.com",
          },
          attachments: [
            {
              filename: "optica.png",
              path: "./Public/optica.jpg",
              cid: "unique@nodemailer.com",
            },
            {
              filename: "linkedin.png",
              path: "./Public/linkedin.png",
              cid: "unique2@nodemailer.com",
            },
            {
              filename: "insta.png",
              path: "./Public/insta.png",
              cid: "unique3@nodemailer.com",
            },
            {
              filename: "facebook.png",
              path: "./Public/facebook.png",
              cid: "unique4@nodemailer.com",
            },
            {
              filename: "ticket.png",
              content: qrCodeimg.split("base64,")[1],
              encoding: "base64",
              cid: "unique9@nodemailer.com",
            },
          ],
        };
        try {
            console.log("Sending Mail" );
            await transporter.sendMail(mailOptions);
            console.log("Mail sent ");
          } catch (err) {
            console.log("Error after transporter", err);
          }
};

// //frontend getting ticket
// module.exports.getQRCode = async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         res.status(400).send('Please enter all fields');
//     }

//     const found = await user.findOne({ email });

//     if (!found) {
//         res.status(400).send('User does not exist');
//     }
//     else{
//         const qrCodeUser = await qrCode.findOne({ user: found._id });
//         if(qrCode){
//             const ticketurl = `${process.env.DOMAIN}/admin/sendOTP/${qrCodeUser.qr_id}`
//             res.status(200).json(ticketurl);
//         }
//         else{
//             res.status(400).send('User does not have a QR Code');
//         }

//     }
// }
