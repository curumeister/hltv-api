const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

async function getMatches(){

  try{
    const { data } = await axios.get("https://www.hltv.org/matches");

    const $ = cheerio.load(data);

    const matches = [];

    $(".liveMatch-container").each((i, el)=>{

      const team1 = $(el).find(".matchTeamName").eq(0).text().trim();
      const team2 = $(el).find(".matchTeamName").eq(1).text().trim();

      const score = $(el).find(".matchScore").text().trim();

      const event = $(el).find(".matchEventName").text().trim();
      const map = $(el).find(".matchMeta").text().trim();

      matches.push({
        team1,
        team2,
        score,
        league: event,
        map
      });
    });

    return matches;

  }catch(err){
    console.log("Erro scraping:", err.message);
    return [];
  }
}

app.get("/api/cs", async (req,res)=>{
  const live = await getMatches();

  res.json({
    live,
    upcoming:[]
  });
});

app.listen(process.env.PORT || 3000);
