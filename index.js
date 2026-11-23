import express from "express";

const app = express();
app.use(express.json());

const RELAY_TOKEN = process.env.RELAY_TOKEN || "meu-token-secreto-123";
const PORT = process.env.PORT || 3000;

app.post("/pje/comunicacao", async (req, res) => {
  try {
    const authHeader = req.headers["x-relay-token"];
    if (authHeader !== RELAY_TOKEN) {
      return res.status(401).json({ erro: "Não autorizado" });
    }

    const params = req.body || {};
    const url = new URL("https://comunicaapi.pje.jus.br/api/v1/comunicacao");

    Object.entries(params).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
        url.searchParams.set(chave, String(valor));
      }
    });

    const respostaPje = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const texto = await respostaPje.text();

    if (!respostaPje.ok) {
      return res.status(respostaPje.status).json({
        erro: `Falha na API do PJe (HTTP ${respostaPje.status})`,
        urlConsultada: url.toString(),
        detalhes: texto
      });
    }

    const json = JSON.parse(texto);
    return res.status(200).json({
      urlConsultada: url.toString(),
      dados: json
    });
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro interno no Relay",
      detalhes: erro.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Relay rodando na porta ${PORT}`);
});
