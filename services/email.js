const nodemailer = require('nodemailer');

require('dotenv').config();

const config = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: 'dianaforost@meta.ua',
    pass: 'Chokolate2005',
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(config);
module.exports = {
  transporter,
};
// const emailOptions = {
//   from: 'dianaforost@meta.ua',
//   to: 'dianaforost@gmail.com',
//   subject: 'Nodemailer test',
//   text: 'Привіт. Ми тестуємо надсилання листів!',
// };

// transporter
//   .sendMail(emailOptions)
//   .then((info) => console.log(info))
//   .catch((err) => console.log(err));
