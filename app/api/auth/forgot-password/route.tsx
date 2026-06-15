import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Generate a secure token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Delete any existing tokens for this email first
    await db.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Save token to DB
    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Construct the reset link
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email.toLowerCase())}`;

    // Send the email via Resend API
    let emailSent = false;
    let emailError = "";
    const resendApiKey =
      process.env.AUTH_RESEND_KEY ??
      process.env.RESEND_API_KEY ??
      process.env.RESEND_KEY;

    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FindWork <onboarding@resend.dev>",
            to: email.toLowerCase(),
            subject: "Reset your FindWork password",
            html: `
              <div style="font-family: system-ui, sans-serif; padding: 24px; color: #111;">
                <h2 style="font-size: 20px; font-weight: normal; margin-bottom: 16px;">Reset your FindWork password</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #555;">You requested a password reset for your FindWork account. Click the button below to set a new password:</p>
                <div style="margin: 24px 0;">
                  <a href="${resetLink}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px;">Reset Password</a>
                </div>
                <p style="font-size: 12px; color: #999;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
        } else {
          emailError = await emailRes.text();
          console.error("Resend API returned error:", emailError);
        }
      } catch (err: any) {
        emailError = err.message;
        console.error("Failed to send email via Resend:", err);
      }
    } else {
      console.warn("No Resend API Key found. Skipping email sending.");
    }

    // Log the link to the terminal console
    console.log("\n==================================================");
    console.log("🔑 PASSWORD RESET REQUEST FOR:", email.toLowerCase());
    console.log("🔗 RESET LINK:", resetLink);
    console.log("==================================================\n");

    // Write to a local reset-link.txt file in the workspace
    try {
      await fs.writeFile(
        path.join(process.cwd(), "reset-link.txt"),
        resetLink,
        "utf-8"
      );
    } catch (writeErr) {
      console.error("Failed to write reset-link.txt:", writeErr);
    }

    // In development mode, we expose the link in the response body for easier browser testing
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      emailSent,
      link: isDev ? resetLink : undefined,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
