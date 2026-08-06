const MOBILE_BUNDLE_ID = "com.easner.mobile"

export function buildAppleAppSiteAssociation(teamId: string) {
  return {
    applinks: {
      apps: [] as string[],
      details: [
        {
          appIDs: [`${teamId}.${MOBILE_BUNDLE_ID}`],
          components: [
            {
              "/": "/auth/callback*",
              comment:
                "Supabase OAuth / magic link return (AuthContext handles; do not open in Safari)",
            },
            {
              "/": "*",
              exclude: true,
              comment: "Marketing pages stay in browser unless we add explicit paths later",
            },
          ],
        },
      ],
    },
  }
}

export function buildAssetLinks(fingerprints: string[]) {
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: MOBILE_BUNDLE_ID,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]
}

export function jsonResponse(
  body: unknown,
  options: { status?: number; cacheMaxAge?: number } = {},
) {
  const { status = 200, cacheMaxAge = 3600 } = options
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        cacheMaxAge > 0 ? `public, max-age=${cacheMaxAge}` : "no-store",
    },
  })
}
