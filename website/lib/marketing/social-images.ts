/**
 * Share images for pages whose route is dynamic. Next.js cannot serve a file-based opengraph-image from a dynamic
 * segment (its URL 404s), so these are static files in public/social, copied from the parent product's card.
 */
const SITE = "https://www.easner.com"

export const socialImages = {
  answers: { url: `${SITE}/social/answers.jpg`, alt: "Easner answers – what Easner is and how each product works." },
  connect: {
    url: `${SITE}/social/connect.jpg`,
    alt: "Easner Connect – a platform's withdraw page with the Easner Connect sheet open beside a phone.",
  },
  business: { url: `${SITE}/social/business.jpg`, alt: "Easner Business Banking \u2013 total balance and recent activity." },
  home: {
    url: `${SITE}/social/home.jpg`,
    alt: "Easner – Your Money. Moved with Ease. Easner Business home with balances and recent payments.",
  },
} as const
