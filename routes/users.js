const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;

// ALTERNATIVE FOR BOTH USER LOGIN AND REGISTER:

// const express = require("express");
// const router = express.Router();
// const User = require("./user.model");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Middleware to hash the password before saving to the database
// function hashPassword(req, res, next) {
//   // Hash the password
//   bcrypt.hash(req.body.password, 10, (err, hash) => {
//     if (err) {
//       return res.status(500).json({
//         error: err
//       });
//     } else {
//       // Replace the plaintext password with the hashed password
//       req.body.password = hash;
//       next();
//     }
//   });
// }

// // Route to register a new user
// router.post("/register", hashPassword, (req, res) => {
//   // Create a new user
//   const user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     role: req.body.role
//   });

//   // Save the user to the database
//   user
//     .save()
//     .then(result => {
//       res.status(201).json({
//         message: "User created!",
//         user: result
//       });
//     })
//     .catch(err => {
//       res.status(500).json({
//         error: err
//       });
//     });
// });

// // Route to login a user
// router.post("/login", (req, res) => {
//   // Find the user by email
//   User.findOne({ email: req.body.email })
//     .exec()
//     .then(user => {
//       // Compare the entered password with the hashed password
//       bcrypt.compare(req.body.password, user.password, (err, result) => {
//         if (err) {
//           return res.status(401).json({
//             message: "Authentication failed"
//           });
//         }
//         if (result) {
//           // Create a JWT token
//           const token = jwt.sign(
//             {
//               email: user.email,
//               userId: user._id,
//               role: user.role
//             },
//             process.env.JWT_KEY,
//             {
//               expiresIn: "1h"
//             }
//           );
//           return res.status(200).json({
//             message: "Authentication successful",
//             token: token
//           });
//         }
//         res.status(401).json({
//           message: "Authentication failed"
//         });
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

// module.exports = router;
