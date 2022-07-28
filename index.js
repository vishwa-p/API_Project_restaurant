const express = require("express");
const path = require("path");
const axios = require("axios");
const qs = require("querystring"); //built-in querystring module for manipulating query strings

//UNCOMMENT THE FOLLOWING TWO LINES IF USING SSL CERTS
//const fs = require("fs"); //file r/w module built-in to Node.js
//const https = require("https"); //built-in https module

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || "8080";

const restUrl = "https://foodbukka.herokuapp.com/api/v1/restaurant";
const menuUrl = "https://foodbukka.herokuapp.com/api/v1/menu";

var code, accessToken;
//var state; //this has been moved to .env

//LOCAL SSL CERTS
/* var opts = {
  ca: [fs.readFileSync("<path_to_rootkey>"), fs.readFileSync("<path_to_rootpem")],
  key: fs.readFileSync("<path_to_key>"),
  cert: fs.readFileSync("<path_to_crt>")
}; */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//set up static path (for use with CSS, client-side JS, and image files)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.get("/listRestaurant", (req, res) => {
  getRestaurant(res);
});
app.get("/listMenu", (req, res) => {
  getMenu(res);
});
app.get("/page-requiring-oauth", (req, res) => {
  if (accessToken !== undefined) {
    getProfileData(res);
  } else {
    startAuthorizing(res);
  }
});
// app.get("/authorize", (req, res) => {
//   if (req.query.code && (req.query.state == process.env.TRAKT_STATE)) {
//     code = req.query.code; //if there's a code in the query string, store it
//   }
//   if (!accessToken && !code) {
//     startAuthorizing(res);
//   } else {
//     getAccessToken(res);
//   }
//   //res.render("auth");
// });

//HTTP server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
/*
//HTTPS server (comment out the HTTP server listening and uncomment 
//this section to use HTTPS (you need SSL certs)
var server = https.createServer(opts, app);

server.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});
*/

/**
 * Function to make a request to retrieve trending movies
 * then render on the page.
 *
 * @param {Response} res The Response for the page to be used for rendering.
 */
function getRestaurant(res) {
  //alternatively:
  /*
  axios.get(<url>, { headers: {} }).then().catch()
  */
  axios(
    //config options
    {
      url: `${restUrl}`,
      method: "get",
      // headers: {
      //   "X-RapidAPI-Key":"941c442ffdmshf3428eada998baep15f8afjsnedd175777711"
      // }
    }
  )
    .then(function (response) {
      var restaurantsInfo = response.data.Result;
      res.render("listRestaurant", {
        title: "Home",
        restaurants: restaurantsInfo,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
}
function getMenu(res) {
  //alternatively:
  /*
  axios.get(<url>, { headers: {} }).then().catch()
  */
  axios(
    //config options
    {
      url: `${menuUrl}`,
      method: "get",
      // headers: {
      //   "X-RapidAPI-Key":"941c442ffdmshf3428eada998baep15f8afjsnedd175777711"
      // }
    }
  )
    .then(function (response) {
      
      var menuInfo = response.data.Result;
      res.render("listMenu", { title: "Home", menus: menuInfo });
    })
    .catch(function (error) {
      console.log(error);
    });
}

/*
 * OAuth-related functions
 * =======================
 * The following functions are to demonstrate how you can write your
 * own code for requesting an OAuth access token. Some of it is
 * simplified. The main takeaway is to follow the API's documentation.
 * Essentially, you're still just making HTTP requests and you need
 * to know what you're expecting to receive as a response.
 *
 * When using a complex API such as a payment API, check for
 * existing code libraries (e.g. Software Development Kit, or SDK).
 * The code in this file demonstrates coding from scratch.
 */

/**
 * Function to redirect to the Trakt authorization page (see documentation
 * for URL) to kickstart the authorization process (OAuth2).
 *
 * @param {Response} res The Response for the page to be used for redirecting.
 */
