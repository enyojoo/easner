"use client"

export const PRODUCTS_HASH = "#products"
export const PRODUCTS_ID = "products"

export function scrollToProductsInstantly() {
  const products = document.getElementById(PRODUCTS_ID)
  if (!products) return false

  const html = document.documentElement
  const previousScrollBehavior = html.style.scrollBehavior
  const scrollMarginTop = Number.parseFloat(window.getComputedStyle(products).scrollMarginTop) || 96
  const top = products.getBoundingClientRect().top + window.scrollY - scrollMarginTop

  html.style.scrollBehavior = "auto"
  window.scrollTo({ top, behavior: "auto" })

  window.requestAnimationFrame(() => {
    html.style.scrollBehavior = previousScrollBehavior
  })

  return true
}

export function scrollToProductsWithPaintRetries() {
  scrollToProductsInstantly()

  let attempts = 0

  const retry = () => {
    attempts += 1

    scrollToProductsInstantly()

    if (attempts >= 6) return

    window.requestAnimationFrame(retry)
  }

  window.requestAnimationFrame(retry)

  for (const delay of [80, 180, 360, 720]) {
    window.setTimeout(scrollToProductsInstantly, delay)
  }
}
