import User from "../models/User.js";
import generateToken, { generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password });

  if (user) {
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  res.json(user);
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Refresh token required" });

  const user = await User.findOne({ refreshToken: token });
  if (!user) return res.status(403).json({ message: "Invalid refresh token" });

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(user._id);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Refresh token required" });

  const user = await User.findOne({ refreshToken: token });
  if (!user) return res.status(400).json({ message: "Invalid token" });

  user.refreshToken = null; // remove refresh token from DB
  await user.save();

  res.json({ message: "User logged out successfully" });
};