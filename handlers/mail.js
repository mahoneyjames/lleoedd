const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport(
    {   
        host:process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }}
);

exports.send = async(options) =>
{
    const html = generateHtml(options.filename, options);

    const mailOptions = {
        from: 'James Mahoney <noreply@chat.cymru',
        to: options.user.email,
        html,
        text: htmlToText.fromString(html),
        subject: options.subject
    };

    const sendMail = promisify(transport.sendMail, transport);
    return await sendMail(mailOptions);
    
};

const generateHtml = (filename, options = {}) =>
{
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    //console.log(html);
    const inlined = juice(html);
    return inlined;
};