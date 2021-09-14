// require files and module
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const { xml } = require("cheerio/lib/static");

// variable to be declare
let venue;
let date;
let result;
let teams = [];


function getScoreCard(url) {
    request(url, FetchMatchDetail); // get the url for all the match in MatchLink
}


function FetchMatchDetail(err, response, html) {
    if (err) console.log(err);
    else {
        MatchCommonDetail(html);
        MatchDetail(html);
    }
}

function MatchCommonDetail(html) {
    let $ = cheerio.load(html);
    let date_venue = $(".match-header-info.match-info-MATCH .description");
    venue = date_venue.text().split(",")[1].trim();
    date = date_venue.text().split(",")[2].trim();
    let result_ = $(".match-header .status-text");
    result = result_.text();
}

function MatchDetail(html) {
    teams = [];
    let $ = cheerio.load(html);
    let innings = $(".card.content-block.match-scorecard-table .Collapsible");
    teams.push($(innings[0]).find("h5").text().split("INNINGS")[0].trim());
    teams.push($(innings[1]).find("h5").text().split("INNINGS")[0].trim());
    for (let i = 0; i < 2; i++) {
        let row = $(innings[i]).find(".table.batsman tbody tr");
        for (let j = 0; j < row.length; j++) {
            let opponentindex = i == 0 ? 1 : 0;
            let cols = $(row[j]).find("td");
            let playerData = [];
            if ($(cols[0]).hasClass("batsman-cell") == true) {
                playerData.push($(cols[0]).text().trim());
                playerData.push($(cols[2]).text().trim());
                playerData.push($(cols[5]).text().trim());
                playerData.push($(cols[6]).text().trim());
                playerData.push($(cols[7]).text().trim());
                processPlayer(teams[i], teams[opponentindex], playerData[0], venue, date, result, playerData[1], playerData[2], playerData[3], playerData[4]);
            }
        }
    }
    //console.log(teams);
}

function processPlayer(teamName, opponent, playerName, venuef, datef, resultf, runs, four, six, score) {
    let teamPath = path.join(__dirname, "ipl", teamName);
    dirCreated(teamPath);
    let playerPath = path.join(teamPath, playerName + ".xlsx");
    let json_data = ReadXlsx(playerPath, playerName);
    let playerObj = {
        teamName,
        opponent,
        playerName,
        venuef,
        datef,
        resultf,
        runs,
        four,
        six,
        score
    };
    json_data.push(playerObj);
    WriteXlsx(playerPath, json_data, playerName);
}

function dirCreated(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

function ReadXlsx(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) return [];
    let wb = xlsx.readFile(filePath);
    let data = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(data);
    return ans; 
}

function WriteXlsx(filePath, json, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

module.exports = {
    getCard: getScoreCard
}