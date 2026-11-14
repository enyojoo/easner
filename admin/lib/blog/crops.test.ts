import { test } from "node:test"
import assert from "node:assert/strict"
import { cropRect, safeArea, squareCropFromView, validateAvatarSize, validateCoverSize, validateUpload } from "./crops.ts"

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} vs ${b}`)

test("cropRect centred, wide image", () => {
  const r = cropRect(2400, 1350, 1200 / 630)
  close(r.w, 2400); close(r.h, 2400 / (1200 / 630)); close(r.x, 0); close(r.y, (1350 - r.h) / 2)
})
test("cropRect follows the focal point and clamps", () => {
  const top = cropRect(2400, 1350, 1, { x: 0, y: 0 })
  assert.deepEqual([top.x, top.y, top.w, top.h], [0, 0, 1350, 1350])
  const right = cropRect(2400, 1350, 1, { x: 1, y: 1 })
  close(right.x, 2400 - 1350); close(right.y, 0)
  const mid = cropRect(2400, 1350, 1, { x: 0.5, y: 0.5 })
  close(mid.x, 525)
})
test("cropRect tall image", () => {
  const r = cropRect(1000, 3000, 16 / 9, { x: 0.5, y: 0.9 })
  close(r.w, 1000); close(r.h, 562.5); close(r.y, 2700 - 562.5 / 2)
})
test("safeArea is the centre 80%", () => {
  assert.deepEqual(safeArea(1000, 500), { x: 100, y: 50, w: 800, h: 400 })
})
test("squareCropFromView", () => {
  const a = squareCropFromView({ imgW: 800, imgH: 600, zoom: 1, offsetX: 0, offsetY: 0 })
  assert.deepEqual([a.x, a.y, a.w, a.h], [100, 0, 600, 600])
  const z = squareCropFromView({ imgW: 800, imgH: 600, zoom: 2, offsetX: 0, offsetY: 0 })
  close(z.w, 300); close(z.x, 250); close(z.y, 150)
  const dragged = squareCropFromView({ imgW: 800, imgH: 600, zoom: 2, offsetX: 10, offsetY: -10 })
  assert.ok(dragged.x >= 0 && dragged.y + dragged.h <= 600)
  assert.equal(squareCropFromView({ imgW: 800, imgH: 600, zoom: 0.2, offsetX: 0, offsetY: 0 }).w, 600)
})
test("size and upload validation", () => {
  assert.equal(validateCoverSize(2400, 1350), null)
  assert.match(validateCoverSize(1200, 800)!, /1600/)
  assert.equal(validateAvatarSize(400, 400), null)
  assert.match(validateAvatarSize(399, 800)!, /400/)
  assert.equal(validateUpload({ type: "image/webp", size: 1000 }), null)
  assert.equal(validateUpload({ type: "image/svg+xml", size: 10 }), "Use a JPG, PNG, WebP, AVIF or GIF image.")
  assert.equal(validateUpload({ type: "image/png", size: 34 * 1024 * 1024 }), "This file is 34 MB. The limit is 20 MB.")
})
