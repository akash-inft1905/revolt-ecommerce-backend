import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

const __dirname = path.resolve(path.dirname(""));

export const generateOTP = () => {
  return Math.floor(Math.random() * 10000);
};

export const Otp_Mail = async (email, generatedOTP) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    // const templatePath = path.resolve(__dirname, "./utils/otpTemplate.ejs");
    // // console.log(__dirname);

    // const htmlContent = await ejs.renderFile(templatePath, { generatedOTP });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP for Verification Email",
      html: `
      <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification Email</title>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: #333333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      .logo {
        max-width: 200px;
        margin-bottom: 20px;
      }

      .message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .body {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .otp {
        font-size: 24px;
        font-weight: bold;
        color: #ffd60a;
        margin-top: 10px;
        margin-bottom: 20px;
      }

      .support {
        font-size: 14px;
        color: #999999;
        margin-top: 20px;
      }

      .highlight {
        font-weight: bold;
        color: #ffd60a;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <a href="https://revoltcollection.com"
        ><img class="logo" src="https://ibb.co/nmgwkwq" alt="Revolt Collection Logo"
      /></a>
      <div class="message">OTP Verification Email</div>
      <div class="body">
        <p>Dear Customer,</p>
        <p>
          Thank you for registering with Revolt Collection. To complete your
          registration, please use the following OTP (One-Time Password) to
          verify your account:
        </p>
        <h2 class="otp">${generatedOTP}</h2>
        <p>
          This OTP is valid for 5 minutes. If you did not request this
          verification, please disregard this email. Once your account is
          verified, you will have access to our online store and its features.
        </p>
      </div>
      <div class="support">
        If you have any questions or need assistance, please feel free to reach
        out to us at
        <a href="mailto:support@revoltcollection.com"
          >support@revoltcollection.com</a
        >. We are here to help!
      </div>
    </div>
  </body>
</html>

  `,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
