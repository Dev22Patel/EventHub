const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "notrealdev2211@gmail.com",
      pass: "fpcefrgdcnjkaokw",
    },
});

async function sendMail(to, sub, msg) {
    return new Promise((resolve, reject) => {
        console.log(`Attempting to send email to: ${to}`);

        transporter.sendMail({
            from: "notrealdev2211@gmail.com",
            to: to,
            subject: sub,
            html: msg,
        }, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error);
            } else {
                console.log('Email sent successfully:', info.response);
                resolve(info);
            }
        });
    });
}

module.exports = sendMail;
