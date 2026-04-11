const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

/* 🔑 SUA API KEY */
const API_KEY = "JAHyrkMMbX2fOe6Z2SWdqvlim4dvA-oldqtkTujuXsQoS6UyUBQ";

/* ===== BUSCAR PARTIDAS ===== */
async function fetchMatches() {
  try {
    const { data } = await axios.get(
      `https://api.pandascore.co/csgo/matches?per_page=20&token=${API_KEY}`
    );

    const live = [];
    const upcoming = [];

    data.forEach(match => {
      const opponents = match.opponents || [];

      if (opponents.length < 2) return;

      const team1 = opponents[0]?.opponent?.name;
      const team2 = opponents[1]?.opponent?.name;

      if (!team1 || !team2) return;

      /* 🔴 AO VIVO */
      if (match.status === "running") {
        const score1 = match.results?.[0]?.score ?? 0;
        const score2 = match.results?.[1]?.score ?? 0;

        live.push({
          team1,
          team2,
          score: `${score1}-${score2}`
        });
      }

      /* ⏱ FUTURO */
      if (match.status === "not_started") {
        const time = match.begin_at
          ? new Date(match.begin_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "--:--";

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
    return { live: [], upcoming: [] };
  }
}

/* ===== ROTA ===== */
app.get("/api/cs", async (req, res) => {
  const data = await fetchMatches();
  res.json(data);
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
