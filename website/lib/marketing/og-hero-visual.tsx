import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { getVisualKind, isPlaceholderOnly } from "@/lib/marketing/assets"
import type { MarketingVisualKind } from "@/lib/marketing/assets"

const websiteDir = join(dirname(fileURLToPath(import.meta.url)), "../..")

const LOCAL_HERO_IMAGES: Record<string, string> = {
  "mkt-hero-personal-01": "assets/personalhero.png",
}

async function loadLocalImageDataUrl(relativePath: string) {
  const image = await readFile(join(websiteDir, relativePath))
  return `data:image/png;base64,${image.toString("base64")}`
}

async function loadHeroImageDataUrl(visualSlot: string) {
  const localPath = LOCAL_HERO_IMAGES[visualSlot]
  if (!localPath) return null

  try {
    return await loadLocalImageDataUrl(localPath)
  } catch {
    return null
  }
}

function OgHeroFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        width: 420,
        height: 460,
        borderRadius: 28,
        border: "1px solid #E4DED1",
        background: "#F8F6F0",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(15,17,16,0.12)",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

function OgHeroImage({ src }: { src: string }) {
  return (
    <OgHeroFrame>
      <img
        src={src}
        alt=""
        width={420}
        height={460}
        style={{ width: 420, height: 460, objectFit: "cover" }}
      />
    </OgHeroFrame>
  )
}

function OgDashboardMockup() {
  const nav = ["Accounts", "Payouts", "Invoices", "Team"]
  const activity = ["Invoice paid · $4,800", "Payout sent · $12,400", "Terminal collection · $128"]

  return (
    <OgHeroFrame>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: "#0F1110",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "rgba(246,243,235,0.3)" }} />
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "rgba(246,243,235,0.2)" }} />
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "rgba(246,243,235,0.2)" }} />
          <div
            style={{
              marginLeft: "auto",
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              padding: "4px 12px",
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Easner Business
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 118,
              borderRight: "1px solid #E9E4D8",
              background: "#F8F6F0",
              padding: 16,
            }}
          >
            <div style={{ width: 72, height: 18, borderRadius: 999, background: "#0F1110", marginBottom: 18 }} />
            {nav.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  marginBottom: 8,
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontSize: 11,
                  color: index === 0 ? "#007ACC" : "#6F756F",
                  background: index === 0 ? "#EAF5FD" : "transparent",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 18, gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6F756F", textTransform: "uppercase" }}>
                Business overview
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#0F1110" }}>$184,920.40</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["USD", "EUR", "NGN"].map((currency, index) => (
                <div
                  key={currency}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    borderRadius: 12,
                    border: "1px solid #E9E4D8",
                    background: "#F8F6F0",
                    padding: 10,
                  }}
                >
                  <div style={{ fontSize: 10, color: "#6F756F" }}>{currency}</div>
                  <div style={{ marginTop: 8, width: 42, height: 8, borderRadius: 999, background: "#0F1110" }} />
                  <div
                    style={{
                      marginTop: 10,
                      height: 4,
                      borderRadius: 999,
                      background: index === 0 ? "#007ACC" : "#D9D4C7",
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0F1110" }}>Recent activity</div>
              {activity.map((item, index) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: index === 0 ? "#0F8A5F" : "#007ACC",
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#6F756F" }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OgHeroFrame>
  )
}

function OgPhoneMockup() {
  return (
    <OgHeroFrame>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 20% 15%, rgba(0,122,204,0.14), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.95), rgba(246,243,235,0.75))",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 220,
            height: 390,
            borderRadius: 32,
            border: "7px solid #0F1110",
            background: "#0F1110",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 24,
              background: "#F6F3EB",
              padding: 14,
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "#6F756F", textTransform: "uppercase" }}>
                  Easner Personal
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#0F1110" }}>$8,420.18</div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "#007ACC",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ borderRadius: 999, background: "#EAF5FD", padding: "6px 12px", fontSize: 10, color: "#007ACC" }}>
                USD
              </div>
              <div style={{ borderRadius: 999, background: "#F8F6F0", padding: "6px 12px", fontSize: 10, color: "#6F756F" }}>
                EUR
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Send", "Receive"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    padding: "12px 0",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#0F1110",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#6F756F", textTransform: "uppercase" }}>
                Recent activity
              </div>
              {[
                ["Sent to Amara O.", "−$250"],
                ["Received · USD", "+$1,200"],
              ].map(([label, amount]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: 10,
                    background: "#FFFFFF",
                    padding: "10px 12px",
                    fontSize: 10,
                  }}
                >
                  <span style={{ color: "#0F1110" }}>{label}</span>
                  <span style={{ color: "#0F1110", fontWeight: 600 }}>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OgHeroFrame>
  )
}

function OgKindMockup({ kind }: { kind: MarketingVisualKind }) {
  const titles: Partial<Record<MarketingVisualKind, string>> = {
    stablecoin: "Stablecoin rails",
    invoice: "Invoice editor",
    card: "Card controls",
    api: "Developer API",
    business: "Business accounts",
    terminal: "Terminal",
    qr: "QR Pay",
    map: "Corridor coverage",
  }

  const title = titles[kind] ?? "Easner product"

  return (
    <OgHeroFrame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 24,
          gap: 16,
          background: "linear-gradient(180deg, #FFFFFF 0%, #F6F3EB 100%)",
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "#6F756F", textTransform: "uppercase" }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                borderRadius: 16,
                border: "1px solid #E9E4D8",
                background: "#FFFFFF",
                padding: 16,
              }}
            >
              <div style={{ width: "42%", height: 10, borderRadius: 999, background: index === 0 ? "#007ACC" : "#D9D4C7" }} />
              <div style={{ width: "72%", height: 8, borderRadius: 999, background: "#E9E4D8" }} />
              <div style={{ width: "56%", height: 8, borderRadius: 999, background: "#F0EDE4" }} />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#007ACC",
            color: "#FFFFFF",
            padding: "12px 18px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Banking-simple UX
        </div>
      </div>
    </OgHeroFrame>
  )
}

function OgHeroMockup({ visualSlot }: { visualSlot: string }) {
  const kind = getVisualKind(visualSlot)

  if (kind === "dashboard") return <OgDashboardMockup />
  if (kind === "phone" || kind === "persona") return <OgPhoneMockup />
  if (kind === "business") return <OgDashboardMockup />

  return <OgKindMockup kind={kind} />
}

export async function renderOgHeroVisual(visualSlot: string) {
  const imageSrc = isPlaceholderOnly(visualSlot) ? null : await loadHeroImageDataUrl(visualSlot)

  if (imageSrc) {
    return <OgHeroImage src={imageSrc} />
  }

  return <OgHeroMockup visualSlot={visualSlot} />
}
