import User from "../model/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";
import { Otp_Mail, generateOTP } from "../utils/nodemailSignupemail.js";
import jwt from "jsonwebtoken";
import {
  generateResetPasswordToken,
  sendResetPasswordEmail,
} from "../utils/nodemailResetPassword.js";

// @desc    Register user
// @route   POST /api/v1/users/register
// @access  Private/Admin
var otp;
export const registerUserCtrl = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  //Check user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    //throw
    throw new Error("User already exists");
  }
  //hash password
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);
  // //create the user
  // const user = await User.create({
  //   fullname,
  //   email,
  //   password: hashedPassword,
  // });
  otp = generateOTP();
  const emailSent = await Otp_Mail(email, otp);
  if (!emailSent) {
    return res
      .status(500)
      .json({ message: "Failed to send reset password email" });
  }

  res.status(201).json({
    status: "success",
    message: "Otp send Successfully",
    // data: user,
  });
});

// @desc    verify email user
// @route   POST /api/v1/users/verify-email
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { fullname, email, password, enteredOTP } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    //throw
    throw new Error("User already exists");
  }
  if (enteredOTP != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({
      status: "success",
      message: "user created successfully",
      data: user,
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public

export const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Find the user in db by email only
  const userFound = await User.findOne({
    email,
  });
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    res.json({
      status: "success",
      message: "User logged in successfully",
      userFound,
      token: generateToken(userFound?._id),
    });
  } else {
    throw new Error("Invalid login credentials");
  }
});

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfileCtrl = asyncHandler(async (req, res) => {
  //find the user
  const user = await User.findById(req.userAuthId).populate("orders");
  res.json({
    status: "success",
    message: "User profile fetched successfully",
    user,
  });
});

// @desc    Update user shipping address
// @route   PUT /api/v1/users/update/shipping
// @access  Private

export const updateShippingAddresctrl = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    city,
    postalCode,
    province,
    phone,
    country,
  } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userAuthId,
    {
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        postalCode,
        province,
        phone,
        country,
      },
      hasShippingAddress: true,
    },
    {
      new: true,
    }
  );
  //send response
  res.json({
    status: "success",
    message: "User shipping address updated successfully",
    user,
  });
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetPasswordToken = generateResetPasswordToken(email);
    // console.log(resetPasswordToken);

    const emailSent = await sendResetPasswordEmail(email, resetPasswordToken);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send reset password email" });
    }

    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error sending reset password link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const token = req.params.token;
    console.log(token);

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    jwt.verify(
      token,
      process.env.JWT_RESET_PASSWORD_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(400)
            .json({ message: "Invalid reset password token" });
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
      }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
