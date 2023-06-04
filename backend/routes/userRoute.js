const express = require("express");
const userRouter = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const { generateToken, validateEmail } = require("../utlis");
const jwt = require("jsonwebtoken");

userRouter.get("/people", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
userRouter.get("/validate-token", (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ valid: false, message: "no token" });
  }
  jwt.verify(token, process.env.VITE_SECRET_JWT_KEY, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true });
  });
});
userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      const emptyFields = [];
      if (!name) {
        emptyFields.push("name");
      }
      if (!email) {
        emptyFields.push("email");
      }
      if (!password) {
        emptyFields.push("password");
      }
      if (!confirmPassword) {
        emptyFields.push("confirmPassword");
      }
      if (emptyFields.length === 1) {
        return res
          .status(400)
          .json({ error: `${emptyFields[0]} field is required` });
      } else {
        return res.status(400).json({ error: "All fields are required" });
      }
    }

    // Check if the name already exists
    const existingName = await User.findOne({ name });

    if (existingName) {
      return res.json({ nameError: "Name already exists" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ emailError: "Email already exists" });
    }

    if (!validateEmail(email)) {
      return res.json({ emailError: "Invalid email format" });
    }
    if (password.length < 8 || password.length > 20) {
      return res.json({
        passwordError: "Password must be between 8 and 20 character",
      });
    }
    if (password !== confirmPassword) {
      return res.json({ confirmPasswordError: "Passwords do not match" });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    if (user) {
      const token = generateToken(user);
      res.status(200).json({
        success: true,
        message: "User register in successfully",
        user: {
          _id: user._id,
          name: user.name,
        },
        token,
      });
    } else {
      res.status(500).json({ error: "User registration failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      const emptyFields = [];
      if (!name) {
        emptyFields.push("name");
      }
      if (!password) {
        emptyFields.push("password");
      }
      if (emptyFields.length === 1) {
        return res
          .status(400)
          .json({ error: `${emptyFields[0]} field is required` });
      } else {
        return res.status(400).json({ error: "All fields are required" });
      }
    }

    // Check if the user exists with the provided name
    const user = await User.findOne({ name });

    if (!user) {
      return res.json({ nameError: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.json({ passwordError: "Invalid password" });
    }

    // Generate a token for the user
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = userRouter;
