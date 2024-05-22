const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const shortid = require("shortid");
dotenv.config();

const app = express();

app.use(express.static("public"));
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("connected");
  }
});

app.use(express.static("public"));

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

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

app.get("/auth/urlshortner", (req, res) => {
  getLinks(req, res);
});

app.post("/shorturl", (req, res) => {
  const longUrl = req.body.longurl;
  console.log(longUrl);
  if (!longUrl) {
    return res.sendStatus(404);
  }
  db.query(
    "SELECT * FROM links WHERE longurl = ?",
    [longUrl],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.sendStatus(404);
      }
      if (results.length === 0) {
        const short = shortid.generate();
        const url = { longUrl: req.body.longurl, shortUrl: short, count: 1 };

        db.query("INSERT INTO links SET ?", url, (error, results) => {
          if (error) {
            console.log("Error in inserting data");
            return;
          }
        });
        getLinks(req, res);
      } else {
        const _short = results[0].shorturl;
        const _count = results[0].count;
        db.query(
          "UPDATE links SET count = ? WHERE `shorturl`=?",
          [_count + 1, _short],
          (error, results) => {
            if (error) {
              console.log("Error in updating data");
              return;
            }
          }
        );
        getLinks(req, res);
      }
    }
  );
});

app.get("/:shortUrl", (req, res) => {
  db.query(
    "SELECT * FROM `links` WHERE `shorturl` = ?",
    [req.params.shortUrl],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.sendStatus(404);
      }
      if (results.length === 0) {
        res.render("error");
      } else {
        res.redirect(results[0].longurl);
      }
    }
  );
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}.`);
});
