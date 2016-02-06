"use strict"

var config = {
  emailOptions: {
    user: 'robot',
    pass: '',
    emailDomain: 'hashplex.com',
    mailServerFqdn: 'smtp.gmail.com',
    mailServerPort: 465,
    fromEmail: 'robot@hashplex.com',
    toEmail: '',
    subject: 'UNFOLLOWED AGAIN',
    plaintextMessage: '',
    htmlMessage: ''
  }, 
  twitOptions: {
      consumer_key:         ''
    , consumer_secret:      ''
    , access_token:         ''
    , access_token_secret:  ''
  },
  checkIntervalSeconds: 180,
  screenName: ''
}
module.exports = config
