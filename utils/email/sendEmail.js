const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
   const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', // Hostinger SMTP server
      port: 465,                  // SSL
      secure: true,               // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });


    await transporter.sendMail({
      from: `"Mallroad House Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = sendEmail;
