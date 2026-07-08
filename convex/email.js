"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: {
    email: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: args.email,
      subject: args.subject,
      html: args.body,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully via Nodemailer");
      return { success: true };
    } catch (error) {
      console.error("Nodemailer error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

