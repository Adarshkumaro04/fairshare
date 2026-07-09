"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      const result = await transporter.sendMail({
        from: `"FairShare" <${process.env.EMAIL_USER}>`,
        to: args.to,
        subject: args.subject,
        html: args.html,
      });
      return { success: true, id: result.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});