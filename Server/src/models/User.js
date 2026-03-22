import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: function () {
        return this.provider === "local";
      },
    },

    roles: {
      type: [String],
      enum: ["guest", "host"],
      default: ["guest"],
    },

    refreshToken: {
      type: String,
      default: null,
    },

    // Forgot password
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Social login
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    facebookId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

  return resetToken;
};

export default mongoose.model("User", userSchema);