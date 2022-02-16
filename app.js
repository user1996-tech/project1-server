const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  // bodyParser.urlencoded({
  //   extended: false,
  // })
  cookieParser()
);

app.use(bodyParser.json());

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "username",
  password: "password",
  database: "project1",
});

//get all users
app.get("/", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");

    connection.query("SELECT * FROM users;", (err, rows) => {
      connection.release();

      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});

app.get("/user/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(
      "SELECT * FROM users WHERE id = ?;",
      [req.params.id],
      (err, rows) => {
        connection.release();

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//sign up
app.get("/signup/:username&:password", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");

    // check if username is taken
    connection.query(
      "SELECT * FROM users WHERE username = ?;",
      req.params.username,
      (err, rows) => {
        if (!err) {
          //username taken
          if (!(rows.length == 0)) {
            res.send(JSON.stringify("error"));

            //username NOT taken
          } else {
            const query = `INSERT INTO users (username, password) VALUES ('${req.params.username}', '${req.params.password}');`;
            connection.query(query, (err, rows) => {
              res.send(JSON.stringify(`success`));
            });
          }
        } else {
          console.log(err);
        }
        connection.release();
      }
    );
  });
});

//Login
app.get("/login/:username&:password", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    let message = "";
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");
    //check username and password combination
    connection.query(
      "SELECT * FROM users WHERE (username = ? AND password = ?);",
      [req.params.username, req.params.password],
      (err, rows) => {
        if (!err) {
          if (rows.length !== 0) {
            //login
            console.log(`${rows[0].username} has logged in`);
            const uid = rows[0].id;
            const username = rows[0].username;
            const result = JSON.stringify(rows[0]);
            res.send(result);

            // res.send(uid.toString());
          } else {
            //wrong combination
            res.send(JSON.stringify("error"));
          }
        } else {
          console.log(err);
        }
        connection.release();
      }
    );
  });
});

//add api key
app.get("/apikey/add/:uid&:apikey", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");

    connection.query(
      "INSERT INTO key_table (uid, api_key) VALUES (?, ?);",
      [req.params.uid, req.params.apikey],
      (err, rows) => {
        if (!err) {
          console.log("api key added");
          res.send("key added");
        } else {
          res.send("error");
          console.log(err);
        }
        connection.release();
      }
    );
  });
});

//get all api keys
app.get("/apikey/get/:uid", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");

    connection.query(
      "SELECT * FROM key_table WHERE uid = ?",
      req.params.uid,
      (err, rows) => {
        if (!err) {
          console.log("api keys fetched");
          console.log(req.params.uid);
          res.send(rows);
        } else {
          console.log("error");
        }
        connection.release();
      }
    );
  });
});

//cookie check
app.get("/cookieCheck", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true");

  console.log(req.cookies);
  res.send(req.cookies);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
