const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
exports.register = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  db.query(
    "SELECT email FROM loginusers WHERE email =?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return res.render("register", {
          message: "This email is already in use",
        });
      } else if (password !== confirmPassword) {
        return res.render("register", {
          message: "Password do not match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      db.query(
        "INSERT INTO loginusers SET ?",
        { name: name, email: email, password: hashedPassword },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            res.render("./login.hbs");
          }
        }
      );
    }
  );
};

exports.login = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    db.query(
      "SELECT * FROM loginusers WHERE email = ?",
      [email],
      async (err, results) => {
        if (
          !results ||
          results.length === 0 ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          return res.render("login", {
            message: "Email or Password is incorrect",
          });
        } else {
          const id = results[0].id;

          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES,
          });

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };
          res.cookie("userSave", token, cookieOptions);
          res.render("index");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};
