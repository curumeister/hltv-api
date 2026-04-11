const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = "JAHyrkMMbX2fOe6Z2SWdqvlim4dvA-oldqtkTujuXsQoS6UyUBQ";

/* ===== BUSCAR MATCHES ===== */
async function fetchMatches() {
  try {
    const [liveRes, upcomingRes] = await Promise.all([
      axios.get(`https://api.pandascore.co/csgo/matches/running?token=${API_KEY}`),
      axios.get(`https://api.pandascore.co/csgo/matches/upcoming?token=${API_KEY}`)
    ]);

    const live = [];
    const upcoming = [];

    /* ===== LIVE ===== */
    liveRes.data.forEach(match => {
      const team1 = match.opponents?.[0]?.opponent?.name || "TBD";
      const team2 = match.opponents?.[1]?.opponent?.name || "TBD";

      const league = match.league?.name || "CS Event";

      let map = "";
      if (match.games?.length) {
        map = match.games[0]?.map || "";
      }

      const score1 = match.results?.[0]?.score ?? 0;
      const score2 = match.results?.[1]?.score ?? 0;

      live.push({
        team1,
        team2,
        score: `${score1}-${score2}`,
        map,
        league
      });
    });

    /* ===== UPCOMING ===== */
    upcomingRes.data.forEach(match => {
      const team1 = match.opponents?.[0]?.opponent?.name || "TBD";
      const team2 = match.opponents?.[1]?.opponent?.name || "TBD";

      const league = match.league?.name || "CS Event";

      const time = match.begin_at
        ? new Date(match.begin_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "soon";

      upcoming.push({
        team1,
        team2,
        time,
        league
      });
    });

    return {
      live: live.slice(0, 2),
      upcoming: upcoming.slice(0, 3)
    };

  } catch (err) {
    console.log("Erro:", err.message);

    return {
      live: [],
      upcoming: [
        {
          team1: "CS",
          team2: "Sem dados",
          time: "--:--",
          league: "Offline"
        }
      ]
    };
  }
}

/* ===== API ===== */
app.get("/api/cs", async (req, res) => {
  const data = await fetchMatches();
  res.json(data);
});

/* ===== START ===== */
app.listen(process.env.PORT || 3000);
