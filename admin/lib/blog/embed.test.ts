import { test } from "node:test"
import assert from "node:assert/strict"
import { detectEmbed } from "./embed.ts"

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
