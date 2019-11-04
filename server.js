var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
 
  axios.get("https://www.webmd.com/news/articles").then(function(response) {
   
    var $ = cheerio.load(response.data);
    
    
    $("ul li").each(function(i, element) {
     
      var result = {};
      result.title = $(this)
        .children("a").children(".article-title")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("a").children(".article-description")
        .text();
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.render("index");
    
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
 
  db.Article.find({})
    .then(function(dbArticle) {
      
      res.json(dbArticle);
    })
    .catch(function(err) {
     
      res.json(err);
    });
});
