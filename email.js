"use strict"

var nodemailer = require('nodemailer');
 
// var options = {
//   user: 'robot',
//   pass: '',
//   mailServerFqdn: 'smtp.gmail.com',
//   fromEmail: 'HashPlex Robot <robot@hashplex.com>',
//   toEmail: 'bernie.rihn@gmail.com',
//   subject: 'UNFOLLOWED AGAIN',
//   plaintextMessage: '',
//   htmlMessage: ''
// }
 
// var mailOptions = {
//     from: 'HashPlex Robot <robot@hashplex.com>', // sender address 
//     to: 'bernie.rihn@gmail.com', // list of receivers 
//     subject: 'UNFOLLOWED AGAIN', // Subject line 
//     text: 'unfollowed...', // plaintext body 
//     html: '' // html body 
// };

function sendEmail(options) {
  return new Promise((resolve, reject) => {
    var mailOptions = {
      from: options.fromEmail,
      to: options.toEmail,
      subject: options.subject,
      text: options.plaintextMessage,
      html: options.htmlMessage
    }
    console.log('OPTIONS: ' + JSON.stringify(options));
    console.log('MAILOPTIONS: ' + JSON.stringify(mailOptions));
    var smtpConfig = {
      host: options.mailServerFqdn,
         port: options.mailServerPort,
         secure: true, // use SSL
         auth: {
           user: options.user + '@' + options.emailDomain,
           pass: options.pass
         } 
    }
    console.log('SMTP CONFIG: ' + JSON.stringify(smtpConfig));
    var transporter = nodemailer.createTransport(smtpConfig);
    transporter.sendMail(mailOptions, (error, info) => {
      if(error) { 
        return reject(new Error(error)); 
      } else {
        // console.log('Message sent: ' + info.response);
        resolve(info);
      }
    });
  });
}

module.exports = sendEmail;
