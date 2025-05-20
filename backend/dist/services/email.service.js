"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Sends an email using Gmail SMTP service.
 *
 * @param to - Recipient email address
 * @param subject - Subject line of the email
 * @param text - Plain text body of the email
 *
 * Uses environment variables EMAIL_USER and EMAIL_PASS for authentication.
 * Creates a transporter on each call - consider optimizing by reusing transporter if sending multiple emails.
 */
const sendEmail = async (to, subject, text) => {
    // Create a transporter object using Gmail SMTP settings
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", // Use Gmail service
        secure: true, // Use SSL (port 465)
        port: 465,
        auth: {
            user: process.env.EMAIL_USER, // Email address to send from
            pass: process.env.EMAIL_PASS, // Email account password or app password
        },
    });
    // Send email with specified parameters
    await transporter.sendMail({
        from: `${process.env.EMAIL_USER}`, // Sender address
        to, // Recipient address
        subject, // Email subject
        text, // Email body (plain text)
    });
};
exports.sendEmail = sendEmail;
