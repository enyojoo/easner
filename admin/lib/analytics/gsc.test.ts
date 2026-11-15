import { test } from "node:test"
import assert from "node:assert/strict"
import { createVerify, generateKeyPairSync } from "node:crypto"
import { createGscFetcher, parseGscRows, parseServiceAccount, signServiceAccountJwt } from "./gsc.ts"

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 })
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString()
const account = JSON.stringify({ client_email: "rollup@example.iam.gserviceaccount.com", private_key: pem })

test("parseGscRows reads page and query keys", () => {
  const rows = parseGscRows({
    rows: [
      { keys: ["https://www.easner.com/blog/send-money/", "send money to nigeria"], clicks: 3, impressions: 40, position: 4.236 },
      { keys: ["https://www.easner.com/"], clicks: 1, impressions: 2, position: 1 },
    ],
  })
  assert.deepEqual(rows, [{ path: "/blog/send-money", query: "send money to nigeria", impressions: 40, clicks: 3, position: 4.24 }])
  assert.deepEqual(parseGscRows({}), [])
})

test("parseServiceAccount validates and unescapes the key", () => {
  assert.throws(() => parseServiceAccount("nope"), /not valid JSON/)
  assert.throws(() => parseServiceAccount("{}"), /client_email/)
  assert.ok(parseServiceAccount(JSON.stringify({ client_email: "a", private_key: "x\\ny" })).private_key.includes("\n"))
})

test("the service account JWT is signed RS256 with the readonly scope", () => {
  const jwt = signServiceAccountJwt(parseServiceAccount(account), 1000)
  const [header, claims, signature] = jwt.split(".")
  assert.equal(JSON.parse(Buffer.from(header, "base64url").toString()).alg, "RS256")
  const body = JSON.parse(Buffer.from(claims, "base64url").toString())
  assert.equal(body.scope, "https://www.googleapis.com/auth/webmasters.readonly")
  assert.equal(body.exp, 4000)
  assert.ok(createVerify("RSA-SHA256").update(`${header}.${claims}`).verify(publicKey, Buffer.from(signature, "base64url")))
})

test("the fetcher trades the JWT for a token once and queries one day", async () => {
  const calls: Array<{ url: string; body: string }> = []
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: String(init.body) })
    if (url.includes("oauth2")) return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 })
    return new Response(JSON.stringify({ rows: [{ keys: ["https://www.easner.com/blog/a", "q"], clicks: 1, impressions: 2, position: 3 }] }), { status: 200 })
  }) as unknown as typeof fetch
  const fetcher = createGscFetcher({ siteUrl: "sc-domain:easner.com", serviceAccountJson: account }, fetchImpl, () => 1_000_000)
  const rows = await fetcher("2026-11-12")
  await fetcher("2026-11-11")
  assert.equal(rows.length, 1)
  assert.equal(calls.filter((c) => c.url.includes("oauth2")).length, 1)
  const query = calls.find((c) => c.url.includes("searchAnalytics"))!
  assert.ok(query.url.includes(encodeURIComponent("sc-domain:easner.com")))
  assert.deepEqual(JSON.parse(query.body), { startDate: "2026-11-12", endDate: "2026-11-12", dimensions: ["page", "query"], rowLimit: 25000, dataState: "final" })
})
