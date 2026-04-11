const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const URL = "https://www.hltv.org/matches";

/* ===== FETCH MATCHES ===== */
async function fetchMatches() {
  try {
    const { data } = await axios.get(URL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);

    const live = [];
    const upcoming = [];

    /* 🔴 LIVE */
    $(".matchList .liveMatch-container").each((_, el) => {
      const team1 = $(el).find(".matchTeamName").first().text().trim();
      const team2 = $(el).find(".matchTeamName").last().text().trim();
      const score = $(el).find(".matchScore").text().trim();

      if (team1 && team2) {
        live.push({
          team1,
          team2,
          score: score || "0-0"
        });
      }
    });

    /* ⏱ UPCOMING */
    $(".upcomingMatchesContainer .upcomingMatch").each((_, el) => {
      const team1 = $(el).find(".matchTeamName").first().text().trim();
      const team2 = $(el).find(".matchTeamName").last().text().trim();
      const time = $(el).find(".matchTime").text().trim();

      if (team1 && team2) {
        upcoming.push({
          team1,
          team2,
          time: time || "--:--"
        });
      }
    });

    return {
      live: live.slice(0, 2),
      upcoming: upcoming.slice(0, 3)
    };

  } catch (err) {
    console.log("Erro HLTV:", err.message);

    return {
      live: [],
      upcoming: []
    };
  }
}

/* ===== API ===== */
app.get("/api/cs", async (req, res) => {
  const data = await fetchMatches();
  res.json(data);
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
