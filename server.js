const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const URL = "https://www.hltv.org/matches";

/* FUNÇÃO PRINCIPAL */
async function fetchMatches() {
  const { data } = await axios.get(URL, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  const live = [];
  const upcoming = [];

  /* 🔴 LIVE */
  $(".liveMatch-container").each((_, el) => {
    const team1 = $(el).find(".matchTeamName").first().text().trim();
    const team2 = $(el).find(".matchTeamName").last().text().trim();
    const score = $(el).find(".matchScore").text().trim();

    if (team1 && team2) {
      live.push({ team1, team2, score });
    }
  });

  /* ⏱ FUTUROS */
  $(".upcomingMatch").each((_, el) => {
    const team1 = $(el).find(".matchTeamName").first().text().trim();
    const team2 = $(el).find(".matchTeamName").last().text().trim();
    const time = $(el).find(".matchTime").text().trim();

    if (team1 && team2) {
      upcoming.push({ team1, team2, time });
    }
  });

  return {
    live: live.slice(0, 2),
    upcoming: upcoming.slice(0, 3)
  };
}

/* ROTA */
app.get("/api/cs", async (req, res) => {
  try {
    const data = await fetchMatches();
    res.json(data);
  } catch {
    res.json({ live: [], upcoming: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("rodando"));
