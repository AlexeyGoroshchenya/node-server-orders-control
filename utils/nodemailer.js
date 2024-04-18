const nodemailer = require('nodemailer')
require('dotenv').config()


const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, //true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
    },
    {
        from: `"Minamoto" <${process.env.EMAIL}>`,
        to: 'minamoto.email@gmail.com',
    }
);

const sendToMail = async (message) => {
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err);
        console.log(info);
    });
}





module.exports = sendToMail

