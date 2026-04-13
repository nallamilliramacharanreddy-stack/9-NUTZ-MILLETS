import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/jwt";
import {
  rateLimit,
  schemas,
  securityResponse,
  logSecurityEvent,
} from "@/lib/security";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  try {
    // ✅ 1. Rate Limiting
    if (!rateLimit(ip, 50, 60 * 1000)) {
      return securityResponse("Too many requests. Try again later.", 429);
    }

    // ✅ 2. Parse Request Body
    let body;
    try {
      body = await req.json();
    } catch {
      return securityResponse("Invalid JSON body", 400);
    }

    // ✅ 3. Validate Input
    const validation = schemas.login.safeParse(body);
    if (!validation.success) {
      console.error("Login Validation Error:", validation.error.format());
      return securityResponse("Invalid input provided. Check email format and password length (min 8).", 400);
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // ✅ 4. Connect DB
    await connectDB();

    // ✅ 5. Find User
    console.log(`[AUTH] Login attempt for: ${normalizedEmail}`);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`[AUTH] Login FAILED: User not found for ${normalizedEmail}`);
      await logSecurityEvent({
        event: "LOGIN_UNKNOWN_USER",
        severity: "WARN",
        ip,
        metadata: { email: normalizedEmail },
      });

      return securityResponse("Invalid email or password", 401);
    }

    // ✅ 6. AUTO VERIFY ALL USERS (IMPORTANT FIX)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // ✅ 7. Lock Check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );

      return securityResponse(
        `Account locked. Try again in ${remaining} min.`,
        403
      );
    }

    // ✅ 8. Password Check
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH] Password match for ${normalizedEmail}: ${isMatch}`);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }

      await user.save();

      await logSecurityEvent({
        event: "LOGIN_FAILURE",
        severity: "WARN",
        ip,
        userId: user._id.toString(),
      });

      return securityResponse("Invalid email or password", 401);
    }

    // ✅ 9. Reset Attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // ✅ 10. Generate Tokens
    const accessToken = signAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
    });

    const hashedRT = hashToken(refreshToken);

    user.refreshTokens = user.refreshTokens || [];

    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift();
    }

    user.refreshTokens.push({
      token: hashedRT,
      deviceId: req.headers.get("user-agent") || "unknown",
      createdAt: new Date(),
    });

    await user.save();

    await logSecurityEvent({
      event: "LOGIN_SUCCESS",
      severity: "INFO",
      ip,
      userId: user._id.toString(),
    });

    // ✅ 11. Response
    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // ✅ 12. Cookies (SECURE)
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 min
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    await logSecurityEvent({
      event: "LOGIN_CRITICAL_ERROR",
      severity: "CRITICAL",
      ip,
      metadata: { error: error.message },
    });

    return NextResponse.json(
      {
        message: error.message?.includes("connect") || error.message?.includes("timeout")
          ? "Database connection failed. Please check your network or MongoDB Atlas settings (IP Whitelist)."
          : error.message?.toLowerCase().includes("auth") || error.message?.toLowerCase().includes("authentication")
          ? "Database Authentication Failed. Please verify your MongoDB URI username and password."
          : "Server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

