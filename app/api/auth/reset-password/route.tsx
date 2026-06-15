import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: "Missing token or email parameters" },
        { status: 400 }
      );
    }

    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        token: token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid reset token or email address" },
        { status: 400 }
      );
    }

    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) {
      // Clean up the expired token
      await db.verificationToken.deleteMany({
        where: {
          identifier: email.toLowerCase(),
          token: token,
        },
      });

      return NextResponse.json(
        { valid: false, error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "An unexpected error occurred during validation" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find and validate the verification token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        token: token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid reset token or email address" },
        { status: 400 }
      );
    }

    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) {
      // Clean up the expired token
      await db.verificationToken.deleteMany({
        where: {
          identifier: email.toLowerCase(),
          token: token,
        },
      });

      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 12);

    // Update the password in database
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashed },
    });

    // Delete the consumed verification token
    await db.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
