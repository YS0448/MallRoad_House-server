const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { executeQuery } = require("../../utils/db/dbUtils");
const { getUTCDateTime } = require("../../utils/date/dateUtils");
const generateToken = require("../../utils/auth/generateToken");
const sendEmail = require("../../utils/email/sendEmail");

const getCurrentUser = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log('user_id000000000:', user_id);

    const user = await executeQuery(
      'SELECT user_id, email, full_name, role, status FROM users WHERE user_id = ?',
      [user_id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user[0]);
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUserQuery =
      "SELECT user_id, email, full_name, password_hash, role, status FROM users WHERE email = ?";
    const user = await executeQuery(findUserQuery, [email]);

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if(user[0].status === 'deactivated') {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user[0].password_hash
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const currentDateTime = getUTCDateTime();
    const updateLoginTimeQuery =
      "UPDATE users SET last_login_at = ? WHERE user_id = ?";
    await executeQuery(updateLoginTimeQuery, [
      currentDateTime,
      user[0].user_id,
    ]);

    const token = generateToken(user[0]);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user[0].user_id,
        user_name: user[0].full_name,
        email: user[0].email,
        role: user[0].role,
        status: user[0].status
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log('req.body:', req.body);
    const role = "customer";
    const status = "active";

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const existingUser = await executeQuery(checkUserQuery, [email]);
    console.log('existingUser:', existingUser);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const currentDateTime = getUTCDateTime();

    const insertUserQuery = `
      INSERT INTO users 
      (full_name, email, password_hash, role, created_at, last_login_at, status)  
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await executeQuery(insertUserQuery, [
      fullName,
      email,
      hashedPassword,
      role,
      currentDateTime,
      currentDateTime,
      status
    ]);

    res.status(201).json({
      message: "User created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Generate 6-digit numeric OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (req, res) => {
  const { email } = req.body;
  const currentDateTime = getUTCDateTime();

  try {
    const findUserQuery = "SELECT user_id, status FROM users WHERE email = ?";
    const user = await executeQuery(findUserQuery, [email]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user[0].status === "deactivated") {
      return res.status(400).json({ message: "User is deactivated. Please contact admin" });
    }      

    const otp = generateOtp();

    const deleteOldOtpQuery = "DELETE FROM password_resets WHERE user_id = ?";
    await executeQuery(deleteOldOtpQuery, [user[0].user_id]);

    const insertOtpQuery =
      "INSERT INTO password_resets (user_id, email, otp, created_at) VALUES (?, ?, ?, ?)";
    await executeQuery(insertOtpQuery, [user[0].user_id, email, otp, currentDateTime]);

    const subject = "Your OTP for Password Reset";
    const body = `Your OTP for Password Reset is: <strong> ${otp}</strong> <br><br>Please use this OTP to reset your password.`;
    await sendEmail(email, subject, body);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const verifyOtpQuery =
      "SELECT * FROM password_resets WHERE email = ? AND otp = ?";
    const record = await executeQuery(verifyOtpQuery, [email, otp]);

    if (record.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const findResetQuery =
      "SELECT * FROM password_resets WHERE email = ? AND otp = ?";
    const resetEntry = await executeQuery(findResetQuery, [email, otp]);

    if (resetEntry.length === 0) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatePasswordQuery =
    "UPDATE users SET password_hash = ? WHERE email = ?";
    await executeQuery(updatePasswordQuery, [hashedPassword, email]);

    const deleteUsedOtpQuery = "DELETE FROM password_resets WHERE email = ?";
    await executeQuery(deleteUsedOtpQuery, [email]);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signup,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  getCurrentUser
};
