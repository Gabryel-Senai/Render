// Conversor: pega o stream AAC da Rádio Marinha e entrega em MP3 (MPEG) para o ETS2.
// Sem dependências externas: só Node + ffmpeg.

const http = require("http");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const SOURCE =
  process.env.SOURCE_URL ||
  "https://stm0.inovativa.net/listen/radiomarinha/radio.mp3";

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];

  // Página simples para o Render saber que o serviço está de pé
  if (path === "/" || path === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Radio Marinha online. Stream em /marinha.mp3\n");
    return;
  }

  if (path !== "/marinha.mp3") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Nao encontrado\n");
    return;
  }

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "no-cache, no-store",
    "icy-name": "Radio Marinha Natal",
    "icy-br": "128",
    Connection: "keep-alive",
  });

  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel", "warning",
      "-reconnect", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      "-i", SOURCE,
      "-vn",
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "2",
      "-f", "mp3",
      "pipe:1",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  ffmpeg.stdout.pipe(res);
  ffmpeg.stderr.on("data", (d) => process.stderr.write(d));

  const stop = () => ffmpeg.kill("SIGKILL");
  req.on("close", stop);
  res.on("close", stop);
  ffmpeg.on("exit", () => res.end());
});

server.listen(PORT, () => console.log("Ouvindo na porta " + PORT));
