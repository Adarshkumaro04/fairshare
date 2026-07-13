import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getReminderLog = query({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    dayKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminderLogs")
      .withIndex("by_from_to_group", (q) =>
        q
          .eq("fromUserId", args.fromUserId)
          .eq("toUserId", args.toUserId)
          .eq("groupId", args.groupId)
          .eq("dayKey", args.dayKey)
      )
      .unique();
  },
});

export const logReminder = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    dayKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reminderLogs")
      .withIndex("by_from_to_group", (q) =>
        q
          .eq("fromUserId", args.fromUserId)
          .eq("toUserId", args.toUserId)
          .eq("groupId", args.groupId)
          .eq("dayKey", args.dayKey)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSentAt: Date.now(),
        sentCount: (existing.sentCount ?? 0) + 1,
      });
    } else {
      await ctx.db.insert("reminderLogs", {
        fromUserId: args.fromUserId,
        toUserId: args.toUserId,
        groupId: args.groupId,
        dayKey: args.dayKey,
        sentCount: 1,
        lastSentAt: Date.now(),
      });
    }
  },
});

export const sendPaymentReminder = action({
  args: {
    toUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    let currentUser;
    try {
      currentUser = await ctx.runQuery(api.users.getCurrentUser);
    } catch {
      return { success: false, reason: "not_authenticated" };
    }

    if (!currentUser) {
      return { success: false, reason: "not_authenticated" };
    }

    const dayKey = new Date().toISOString().slice(0, 10);

    const existing = await ctx.runQuery(api.reminders.getReminderLog, {
      fromUserId: currentUser._id,
      toUserId: args.toUserId,
      groupId: args.groupId,
      dayKey,
    });

    if (existing?.sentCount >= 999999) {
      return { success: false, reason: "daily_limit_reached" };
    }

    const toUser = await ctx.runQuery(api.users.getUserById, {
      userId: args.toUserId,
    });

    if (!toUser?.email) {
      return { success: false, reason: "no_email" };
    }

    const html = `
      <h2>FairShare – Payment Reminder</h2>
      <p>Hi ${toUser.name}, ${currentUser.name} sent you a friendly reminder:</p>
      <p>You owe <strong>$${args.amount.toFixed(2)}</strong>. Please settle up when you can!</p>
    `;

    const result = await ctx.runAction(api.email.sendEmail, {
      to: toUser.email,
      subject: `${currentUser.name} sent you a payment reminder`,
      html: html,
    });

    if (!result.success) {
      return { success: false, reason: "send_failed", error: result.error };
    }

    await ctx.runMutation(api.reminders.logReminder, {
      fromUserId: currentUser._id,
      toUserId: args.toUserId,
      groupId: args.groupId,
      dayKey,
    });

    return { success: true };
  },
});



