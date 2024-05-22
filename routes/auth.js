const express = require("express");
const authController = require("../controller/auth");

const router = express.Router();

router.post("/login", authController.register);

router.post("/urlshortner", authController.login);

module.exports = router;
