const express = require("express");
const router = express.Router();

const { ArticlesController } = require("../controllers/articles.controller");
const Articles = require("../models/Article1");
const Comments = require("../models/Comment");
const mongoose = require("mongoose");
const auth = require("./auth");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

router.get("/lillachoice", function (req, response) {
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  const TOKEN_PATH = "token.json";
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    authorize(JSON.parse(content), listMajors);
  });

  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err)
          return console.error(
            "Error while trying to retrieve access token",
            err
          );
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }
  const carlo = [];
  const pezzo = [];
  const visinoskij = [];
  const natalia = [];
  const misovic = [];
  const evilloh = [];
  const matteo = [];

  function listMajors(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: "1c-Rcks_3BTNpCMeJnUWPI3W4PvSfO9u00WjHUt2Zskg",
        range: "B:H",
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const rows = res.data.values;
        if (rows.length) {
          rows.map((row) => {
            carlo.push(row[0]);
            pezzo.push(row[1]);
            visinoskij.push(row[2]);
            natalia.push(row[3]);
            misovic.push(row[4]);
            evilloh.push(row[5]);
            matteo.push(row[6]);
            // console.log(`${row[0]}`);
            // console.log(row[1])
          });
          const choices = {
            carlo,
            pezzo,
            visinoskij,
            natalia,
            misovic,
            evilloh,
            matteo,
          };
          response.json(choices);
        } else {
          console.log("No data found.");
        }
      }
    );
  }
});

// Route to post a new article
router.post("/newArticle", auth.required, new ArticlesController().postArticle);

// Route to get all articles
router.get("/", new ArticlesController().getAllArticles);

// Retrieve a single article

router.get("/:id", new ArticlesController().getArticle);

// Route to delete an article

router.delete("/:id", auth.required, new ArticlesController().deleteArticle);

// Update a single article

router.put(
  "/update/:id",
  auth.required,
  new ArticlesController().updateArticle
);

// Retrieve a single article

// router.get('/:id', function (req, res) {
//   let { id } = req.params;
//   Articles.findOne({_id: id})
//   .populate('Comment')
//   .exec(function(error, doc) {
//     if (error) return console.log('Error in retrieving your single Article', doc);
//     console.log("here's the post", doc)
//     res.json(doc);
//   })
// });

// Post Comment

router.post("/comments/:id", auth.optional, async function (req, res, next) {
  let { id } = req.params;
  const article = await Articles.findOne({ _id: id });
  const comment = await new Comments(req.body);
  console.log(req.body);
  return comment.save().then((comentone) => {
    article.comments.push(comment);
    return article.save().then(function (commentino) {
      console.log("added comment to the article", commentino);
      res.json(comment);
    });
  });
});

module.exports = router;
