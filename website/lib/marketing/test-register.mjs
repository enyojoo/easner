import { register } from "node:module"
import { pathToFileURL } from "node:url"

register(new URL("./test-resolve.mjs", import.meta.url).href, {
  parentURL: import.meta.url,
  data: { root: new URL("../../", import.meta.url).href },
})
