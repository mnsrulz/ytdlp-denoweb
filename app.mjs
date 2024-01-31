import Fastify from "fastify";
import ytdlp from "youtube-dl-exec";

const app = Fastify({
  logger: true,
});

app.get("/ytapi/:v/stream.m3u8", async (request, reply) => {
  const { v } = request.params;
  const yturl = `https://www.youtube.com/v/${v}`;
  const metadata = await ytdlp(yturl, { dumpSingleJson: true });
  const rs = metadata.formats.find((x) => x.manifest_url)?.manifest_url;
  return rs ? reply.redirect(rs) : reply.callNotFound();
});
app.get("/ytapi/:v/stream.strm", async (request, reply) => {
  const { v } = request.params;
  const myurl = `http://${request.headers.host}/ytapi/${v}/stream.m3u8`;
  return reply.send(myurl);
});

// Run the server!
try {
  await app.listen({ port: 8000, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
