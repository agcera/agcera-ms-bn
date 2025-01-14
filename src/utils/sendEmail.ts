import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendEmail(user_email: string, subject: string, text: string): Promise<boolean> {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.COMPANY_APP_PASSWORD,
    },
  });

  // Defining the email options
  const mailOptions = {
    from: process.env.COMPANY_EMAIL,
    to: user_email,
    subject,
    text,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export default sendEmail;
