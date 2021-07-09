const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

//Import des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Route de création d'utilisateur
router.post("/vinted/user/signup", async (req, res) => {
  try {
    const checkEmail = await User.findOne({ email: req.fields.email });
    //console.log(checkEmail);
    if (!checkEmail) {
      const generatedSalt = uid2(16);
      const generatedHash = SHA256(
        req.fields.password + generatedSalt
      ).toString(encBase64);
      const generatedToken = uid2(64);
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
          avatar: req.files.avatar.path,
        },
        token: generatedToken,
        hash: generatedHash,
        salt: generatedSalt,
      });
      await newUser.save();

      //res.json("User created");
      res.status(200).json({
        id: newUser._id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
          phone: newUser.account.phone,
        },
      });
    } else {
      res.status(400).json({ message: "Cet e-mail existe déjà" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Route de login
router.post("/vinted/user/login", async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.fields.email });
    const checkHash = SHA256(req.fields.password + checkUser.salt).toString(
      encBase64
    );
    if (checkUser.hash === checkHash) {
      res.status(200).json({
        _id: checkUser._id,
        token: checkUser.token,
        account: {
          username: checkUser.account.username,
          phone: checkUser.account.phone,
        },
      });
    } else {
      res.status(200).json({ message: "Wrong password" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
