"use strict";

var config = {
  emailOptions: {
    user: 'alerts.bernie.rihn',
    pass: '',
    emailDomain: 'gmail.com',
    mailServerFqdn: 'smtp.gmail.com',
    mailServerPort: 465,
    fromEmail: 'alerts.bernie.rihn@gmail.com',
    toEmail: 'bernie.rihn@gmail.com',
    subject: 'UNFOLLOWED AGAIN',
    plaintextMessage: '',
    htmlMessage: ''
  },
  twitOptions: {
      consumer_key:         '',
      consumer_secret:      '',
      access_token:         '',
      access_token_secret:  ''
  },
  checkIntervalSeconds: 180,
  screenName: ''
};
module.exports = config;
