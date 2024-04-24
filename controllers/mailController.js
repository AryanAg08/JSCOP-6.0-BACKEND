const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'kartikaggarwal12jee@gmail.com',
        pass: 'klakuijcclvokrrg'
    }
});

transporter.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.resolve('./controllers'), 
        defaultLayout: false,
    },
    viewPath: path.resolve('./controllers'), 
    extName: '.handlebars',
}));

module.exports.sendSpecificMail = async (req, res) => {
    const { selectedEmails, customText, subject } = req.body;

    try {
        for (const email of selectedEmails) {
            const mailOptions = {
                from: 'kartikaggarwal12jee@gmail.com',
                to: email,
                subject: subject,
                template: 'email',
                context: {
                    title: 'Event Confirmation',
                    message: customText,
                    imageUrl: 'cid:unique@nodemailer.com'
                },
                attachments: [{
                    filename: 'optica.png',
                    path: './Public/optica.jpg',
                    cid: 'unique@nodemailer.com'
                }]
            };
            await transporter.sendMail(mailOptions);
            console.log(`Mail sent to ${email}!!`);
        }
        res.status(200).send("All mails sent successfully!!");
    } catch (error) {
        console.error('Error Sending Mail:', error);
        res.status(500).send('Error Sending Mail');
    }
};

