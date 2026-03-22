import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";
import generateToken, { generateRefreshToken } from "../../lib/generateToken.js";
import sendEmail from "../../lib/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  roles: Array.isArray(user.roles) ? user.roles : ["guest"],
  provider: user.provider || "local",
});

const buildAuthResponse = (user, accessToken, refreshToken, message) => ({
  success: true,
  message: message || "Authentication successful",
  user: sanitizeUser(user),
  accessToken,
  refreshToken,
});

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const requestedRole = role === "host" ? "host" : "guest";

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    const roles = requestedRole === "host" ? ["guest", "host"] : ["guest"];

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      roles,
      provider: "local",
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json(
      buildAuthResponse(
        user,
        accessToken,
        refreshToken,
        "Account created successfully"
      )
    );
  } catch (err) {
    console.error("Register error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.provider !== "local" && !user.password) {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.provider} login. Please continue with ${user.provider}.`,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!Array.isArray(user.roles)) {
      user.roles = ["guest"];
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json(
      buildAuthResponse(user, accessToken, refreshToken, "Login successful")
    );
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("GetMe error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("RefreshToken error:", err);

    return res.status(403).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

// LOGOUT USER
export const logoutUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    user.refreshToken = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// BECOME HOST
export const becomeHost = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(user.roles)) {
      user.roles = ["guest"];
    }

    const alreadyHost = user.roles.includes("host");

    if (!alreadyHost) {
      user.roles.push("host");
      user.roles = [...new Set(user.roles)];
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json(
      buildAuthResponse(
        user,
        accessToken,
        refreshToken,
        alreadyHost ? "User is already a host" : "You are now a host"
      )
    );
  } catch (error) {
    console.error("BecomeHost error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while upgrading user to host",
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Generic response for security
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    if (user.provider !== "local") {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = user.generateResetToken();
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Reset your password here: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset your password</h2>
          <p>You requested a password reset.</p>
          <p>
            <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
              Click here to reset your password
            </a>
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while sending reset link",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (String(password).trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    user.password = password;
    user.provider = user.provider || "local";
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch Google account email",
      });
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || "Google User";

    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        provider: "google",
        googleId,
        roles: ["guest"],
      });
    } else {
      user.name = user.name || name;
      user.googleId = googleId;
      if (!user.provider || user.provider === "local") {
        user.provider = user.googleId ? "google" : user.provider;
      }
      await user.save();
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json(
      buildAuthResponse(
        user,
        accessToken,
        refreshToken,
        "Google login successful"
      )
    );
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

// FACEBOOK LOGIN
export const facebookLogin = async (req, res) => {
  try {
    const { accessToken: facebookAccessToken } = req.body;

    if (!facebookAccessToken) {
      return res.status(400).json({
        success: false,
        message: "Facebook access token is required",
      });
    }

    const profileResponse = await axios.get(
      "https://graph.facebook.com/me",
      {
        params: {
          fields: "id,name,email",
          access_token: facebookAccessToken,
        },
      }
    );

    const profile = profileResponse.data;

    if (!profile?.id || !profile?.email) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch Facebook profile",
      });
    }

    const email = profile.email.toLowerCase().trim();
    const facebookId = profile.id;
    const name = profile.name || "Facebook User";

    let user = await User.findOne({
      $or: [{ email }, { facebookId }],
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        provider: "facebook",
        facebookId,
        roles: ["guest"],
      });
    } else {
      user.name = user.name || name;
      user.facebookId = facebookId;
      if (!user.provider || user.provider === "local") {
        user.provider = user.facebookId ? "facebook" : user.provider;
      }
      await user.save();
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json(
      buildAuthResponse(
        user,
        accessToken,
        refreshToken,
        "Facebook login successful"
      )
    );
  } catch (error) {
    console.error("Facebook login error:", error);

    return res.status(500).json({
      success: false,
      message: "Facebook login failed",
    });
  }
};