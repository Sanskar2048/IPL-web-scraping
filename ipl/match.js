// require files and module
const request = require("request");
const cheerio = require("cheerio");
const ScoreCard = require("./player.js");
const fs = require("fs");
const path= require("path");



const iplPath = path.join(__dirname,"ipl");
dirCreated(iplPath);

// variable to be declare
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";
const MatchLink = [];

// flow of code
request(url, FetchResultList); // get the url for all the match in MatchLink

function FetchResultList(err, response, html) {
    if (err) console.log(err);
    else ResultList(html);
}

function ResultList(html) {
    let StartingUrl = "https://www.espncricinfo.com";
    let $ = cheerio.load(html);
    let list = $("a[data-hover='Scorecard']");
    for (let i = 0; i < list.length; i++) {
        MatchLink.push(StartingUrl + $(list[i]).attr("href"));
    }
    //console.log(MatchLink);
    for (let i = 0; i < MatchLink.length; i++)
        ScoreCard.getCard(MatchLink[i]);
}

function dirCreated(filePath){
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath);
    }
}


