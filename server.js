const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

/* 🔑 SUA API KEY (troque depois por uma nova) */
const API_KEY = JAHyrkMMbX2fOe6Z2SWdqvlim4dvA-oldqtkTujuXsQoS6UyUBQ;

/* ===== BUSCAR PARTIDAS ===== */
async function fetchMatches() {
  try {
    const { data } = await axios.get(
      `https://api.pandascore.co/csgo/matches?sort=begin_at&per_page=10&token=${API_KEY}`
    );

    const live = [];
    const upcoming = [];

    data.forEach(match => {
      const team1 = match.opponents[0]?.opponent?.name;
      const team2 = match.opponents[1]?.opponent?.name;

      if (!team1 || !team2) return;

      /* 🔴 AO VIVO */
      if (match.status === "running") {
        live.push({
          team1,
          team2,
          score: `${match.results[0]?.score || 0}-${match.results[1]?.score || 0}`
        });
      }

      /* ⏱ FUTUROS */
      if (match.status === "not_started") {
        const time = new Date(match.begin_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });

        upcoming.push({
          team1,
          team2,
          time
        });
      }
    });

    return {
      live: live.slice(0, 2),
      upcoming: upcoming.slice(0, 3)
    };

  } catch (err) {
    console.log("Erro PandaScore:", err.message);

    return {
      live: [],
      upcoming: []
    };
  }
}

/* ===== ROTA API ===== */
app.get("/api/cs", async (req, res) => {
  const data = await fetchMatches();
  res.json(data);
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
