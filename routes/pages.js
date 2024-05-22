const express = require("express");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

const router = express.Router();

router.get("/", (req, res) => {
  res.render("register");
});
router.get("/login", (req, res) => {
  res.render("login");
});

function getLinks(req, res) {
  db.query("SELECT * FROM links ORDER BY id DESC", (error, results) => {
    if (error) {
      console.log(error);
      return;
    } else {
      res.render("index", { results: results });
    }
  });
}

router.get("/auth/urlshortner", (req, res) => {
  getLinks(req, res);
});

module.exports = router;
