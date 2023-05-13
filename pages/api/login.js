// Handle POST login requests - returns JWT token and saves it to localStorage.
const usersModel = require("../../server/models/userSchema");
const jwt = require("jsonwebtoken");
// import and use Jose:
const jose = require("jose");

// import DB connection
const connectDB = require("../../db");

// take key from process.env and set it as a uint8Array using TextEncoder() **** For testing using string as key, set to use process.env NB NB****
const secretKey = new TextEncoder().encode("€"); // with "€" the uint8Array should be [226, 130, 172]

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // connect to DB
      await connectDB();

      // find existing user details
      const userInfo = await usersModel.findOne({
        username: req.body.username,
      });
      // check if user exists
      if (userInfo) {
        // Check if password is correct
        if (req.body.password === userInfo.password) {
          let jwtToken = jwt.sign(
            {
              username: userInfo.username,
              // Save admin details - NOTE: Add other priveliges (host/GM) here if wanted
              isAdmin: userInfo.isAdmin,
            },
            secretKey // *** this is key ***
          );
          // for testing
          console.log(jwtToken);
          // If password is correct: respond with message and token
          res.send({ message: "You have logged in", token: jwtToken });
        } else {
          res.status(401).send({ message: "wrong password" });
        }
      } else {
        res.status(404).send({ message: "user not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Internal server error" });
    }
  }
}