import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const generateResetPasswordToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_RESET_PASSWORD_SECRET, {
    expiresIn: "5m",
  });
};

export const sendResetPasswordEmail = async (email, token) => {
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

    const resetPasswordLink = `${process.env.RESET_PASSWORD_URL}?token=${token}`;

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password Email</title>
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

            .cta {
              display: inline-block;
              padding: 10px 20px;
              background-color: #FFD60A;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              margin-top: 20px;
            }

            .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <a href="https://revoltcollection.com"><img class="logo"
              src="https://example.com/revoltcollection_logo.png" alt="Revolt Collection Logo"></a>
            <div class="message">Reset Password Email</div>
            <div class="body">
              <p>You have requested to reset your password for your Revolt Collection account.</p>
              <p>Please click on the link below to reset your password:</p>
              <a class="cta" href="${resetPasswordLink}">Reset Password</a>
              <p>If you did not request to reset your password, you can safely ignore this email.</p>
            </div>
            <div class="support">If you need further assistance, please contact our support team at <a href="mailto:support@revoltcollection.com">support@revoltcollection.com</a>.</div>
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
