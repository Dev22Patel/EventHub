const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: "notrealdev2211@gmail.com",
      pass: "fpcefrgdcnjkaokw",
    },
  });

  function sendMail(to,sub,msg){
    transporter.sendMail({
        from:"notrealdev2211@gmail.com",
        to:to,
        subject:sub,
        html: msg,
    })
  }

  module.exports=sendMail;
