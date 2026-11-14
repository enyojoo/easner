#!/usr/bin/env node
/**
 * Applies supabase/migrations + seed.sql to an in-memory Postgres (PGlite) with Supabase stubs, then runs
 * rls.test.sql. Lets the schema and RLS rules be checked without Docker.
 *
 *   npm run test:db
 *
 * With the local Supabase stack running, prefer the real thing:
 *   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PGlite } from "@electric-sql/pglite"

const here = path.dirname(fileURLToPath(import.meta.url))
const supabaseDir = path.resolve(here, "..")
const read = (file) => fs.readFileSync(file, "utf8")

const notices = []
const db = new PGlite()
const onNotice = (notice) => notices.push(notice.message)

async function run(label, sql) {
  try {
    await db.exec(sql, { onNotice })
  } catch (error) {
    for (const line of notices.splice(0)) console.log(`  ${line}`)
    console.error(`\n✗ ${label}: ${error.message}`)
    if (error.where) console.error(error.where)
    process.exit(1)
  }
}

await run("supabase stubs", read(path.join(here, "support/supabase-stubs.sql")))

const migrations = fs
  .readdirSync(path.join(supabaseDir, "migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort()
for (const file of migrations) {
  await run(`migration ${file}`, read(path.join(supabaseDir, "migrations", file)))
  console.log(`✓ applied ${file}`)
}
await run("seed.sql", read(path.join(supabaseDir, "seed.sql")))
console.log("✓ applied seed.sql\n")

await run("rls.test.sql", read(path.join(here, "rls.test.sql")))
const passed = notices.filter((line) => line.startsWith("ok - "))
for (const line of passed) console.log(`  ${line}`)
console.log(`\n✓ ${passed.length} checks passed`)
await db.close()
