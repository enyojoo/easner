import { test } from "node:test"
import assert from "node:assert/strict"
import { detectEmbed, embedPlayerSrc, embedPosterSrc } from "./embed.ts"

test("recognises the four providers", () => {
  assert.deepEqual(detectEmbed("https://www.youtube.com/watch?v=abc123"), {
    provider: "youtube",
    url: "https://www.youtube.com/watch?v=abc123",
    id: "abc123",
  })
  assert.equal(detectEmbed("https://youtu.be/abc123")?.provider, "youtube")
  assert.equal(detectEmbed("https://www.youtube.com/shorts/abc123")?.id, "abc123")
  assert.equal(detectEmbed("https://vimeo.com/76979871")?.provider, "vimeo")
  assert.equal(detectEmbed("https://www.loom.com/share/0123abcd")?.provider, "loom")
  assert.equal(detectEmbed("https://x.com/easnerbanking/status/1234567890")?.provider, "x")
  assert.equal(detectEmbed("https://twitter.com/a/status/9")?.provider, "x")
})

test("rejects other addresses and non-URLs", () => {
  assert.equal(detectEmbed("https://example.com/video"), null)
  assert.equal(detectEmbed("https://www.youtube.com/"), null)
  assert.equal(detectEmbed("https://x.com/easnerbanking"), null)
  assert.equal(detectEmbed("see https://youtu.be/abc"), null)
  assert.equal(detectEmbed("not a url"), null)
})

test("player and poster addresses", () => {
  const yt = detectEmbed("https://youtu.be/abc123")
  assert.equal(embedPlayerSrc(yt), "https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0")
  assert.equal(embedPosterSrc(yt), "https://i.ytimg.com/vi/abc123/hqdefault.jpg")
  assert.match(embedPlayerSrc(detectEmbed("https://vimeo.com/76979871")) ?? "", /player\.vimeo\.com\/video\/76979871/)
  assert.match(embedPlayerSrc(detectEmbed("https://www.loom.com/share/0123abcd")) ?? "", /loom\.com\/embed\/0123abcd/)
  assert.equal(embedPlayerSrc(detectEmbed("https://x.com/a/status/9")), null)
  assert.equal(embedPosterSrc(detectEmbed("https://vimeo.com/76979871")), null)
  assert.equal(embedPlayerSrc(null), null)
})
