import Fastify from "fastify";
import ytdlp from "youtube-dl-exec";
import HLS from 'hls-parser';
const { MasterPlaylist } = HLS.types;

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
  const myurl = `http://${request.headers.host}/ytapi/${v}/beststream.m3u8`;
  return reply.send(myurl);
});

app.get("/ytapi/:v/beststream.m3u8", async (request, reply) => {
  const { v } = request.params;
  const yturl = `https://www.youtube.com/v/${v}`;
  const metadata = await ytdlp(yturl, { dumpSingleJson: true });
  const manifestUrl = metadata.formats.find((x) => x.manifest_url)?.manifest_url;
  const manifestData = await fetch(manifestUrl).then(x => x.text());
  const parsedHls = HLS.parse(manifestData);
  // var bestVp9Variant = parsedHls.variants.filter(x => x.codecs.startsWith('vp09')).sort((a, b) => b.bandwidth - a.bandwidth)[0];
  // bestVp9Variant.subtitles = []
  var bestAvcVariant = parsedHls.variants.filter(x => x.codecs.startsWith('avc')).sort((a, b) => b.bandwidth - a.bandwidth)[0];
  bestAvcVariant.subtitles = []
  const minimalPlaylist = new MasterPlaylist({ variants: [bestAvcVariant] });
  const streamData = HLS.stringify(minimalPlaylist);
  return reply.send(streamData);
});

// Run the server!
try {
  await app.listen({ port: 8000, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
