//Node Modules
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var pdf = require('html-pdf');
var path = require('path');

//Templates
var briefHbs = require('./brief.hbs');
var mailHbs = require('./mail.hbs');

//Data & Configuration
var address = require('./address.json');
var config = require('./config.json');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.smtpConfig);

//Create Variable holding absolute path of logo
var imgSrc = 'file://' + __dirname + '/'+ config.logo;
imgSrc = path.normalize(imgSrc);

for (var i = 0; i < address.length; i++) {
  (function(addr){
    addr.logo = imgSrc; //add path of logo to data
    pdf.create(briefHbs(addr), config.pdfOptions).toBuffer(function(error, buffer){
      if(error) {
        return console.log(error);
      }
      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: config.from, // sender address
          to: addr.Mail, // list of receivers
          bcc: config.bcc,
          subject: config.subject, // Subject line
          html: mailHbs(addr), // html body
          attachments: [{
              filename: config.filename,
              content: buffer,
          }]

      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent to '+addr.Mail+': ' + info.response);
      });
    });

  })(address[i]);
}
