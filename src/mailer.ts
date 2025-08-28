import nodemailer from "nodemailer";
import logger from "utils/logger.js";
export const sendverificationmail = async (to: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailoption = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verification Mail",
    text: `Your verification code is ${code}`,
  };
  try {
    logger.info("Sending verification email...");
    await transporter.sendMail(mailoption);
  } catch (error) {
    logger.error("Error sending email:", error);
  }
};
