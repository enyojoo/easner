/* eslint-disable no-restricted-syntax -- email clients cannot use CSS variables, so the email carries literal brand colours */
import "server-only"

/**
 * The invite email: AWS SES, the same account and region the banking app sends from (eu-west-2, easner.com
 * verified). The look follows the sign-in code email in supabase/templates/otp-code.html.
 */
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

export type InviteEmail = {
  to: string
  inviteeName: string
  inviterName: string
  roleLabel: string
  signInUrl: string
}

let client: SESv2Client | null = null

function sesClient(): SESv2Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
  if (!accessKeyId || !secretAccessKey) return null
  client ??= new SESv2Client({
    region: process.env.SES_REGION?.trim() || process.env.AWS_REGION?.trim() || "eu-west-2",
    credentials: { accessKeyId, secretAccessKey },
  })
  return client
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string)

export function inviteSubject(): string {
  return "You’re invited to the Easner Website Admin"
}

export function renderInvite(input: InviteEmail): { html: string; text: string } {
  const greeting = input.inviteeName.trim() ? `Hi ${escapeHtml(input.inviteeName.trim().split(/\s+/)[0])},` : "Hi,"
  const textGreeting = input.inviteeName.trim() ? `Hi ${input.inviteeName.trim().split(/\s+/)[0]},` : "Hi,"
  const inviter = escapeHtml(input.inviterName)
  const role = escapeHtml(input.roleLabel.toLowerCase())
  const url = escapeHtml(input.signInUrl)
  const font = "Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light only"><title>${escapeHtml(inviteSubject())}</title></head>
<body style="margin:0;padding:0;background-color:#F8F6F0;font-family:${font};color:#1C201E;line-height:1.6;">
<div style="display:none!important;visibility:hidden;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${inviter} invited you to write for Easner.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8F6F0" style="width:100%;background-color:#F8F6F0;"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;background-color:#FFFFFF;border:1px solid #E9E4D8;border-radius:16px;border-collapse:separate;overflow:hidden;">
<tr><td align="center" style="padding:48px 32px 32px;border-bottom:1px solid #E9E4D8;text-align:center;">
<img src="https://auth.easner.com/storage/v1/object/public/brand/Easner%20LogoB.png" alt="Easner" width="120" style="display:block;margin:0 auto 24px;width:120px;max-width:100%;height:auto;border:0;">
<h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:#0F1110;">You’re invited</h1>
<p style="margin:0;font-size:15px;line-height:1.5;color:#5F655F;">Easner Website Admin</p>
</td></tr>
<tr><td style="padding:40px 32px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3D403D;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3D403D;">${inviter} invited you to the Easner Website Admin as ${/^[aeiou]/i.test(input.roleLabel) ? "an" : "a"} <strong>${role}</strong>. It’s where the Easner blog is written and published.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;"><tr><td style="border-radius:10px;background-color:#007ACC;"><a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;">Sign in</a></td></tr></table>
<div style="background-color:#F8F6F0;border:1px solid #E9E4D8;border-left:3px solid #007ACC;padding:20px 22px;border-radius:0 12px 12px 0;">
<h3 style="margin:0 0 8px;font-size:15px;line-height:1.4;font-weight:600;color:#0F1110;">How signing in works</h3>
<p style="margin:0;font-size:14px;line-height:1.6;color:#3D403D;">Enter this email address (${escapeHtml(input.to)}) on the sign-in page and we send a 6-digit code. The first time, you also set up an authenticator app, which keeps the admin secure.</p>
</div>
</td></tr>
<tr><td align="center" style="padding:28px 32px 32px;border-top:1px solid #E9E4D8;text-align:center;">
<p style="margin:0;font-size:11px;line-height:1.6;color:#5F655F;">© 2026 Easner Group, Inc. All rights reserved.<br>You received this email because ${inviter} invited you to the Easner Website Admin. If you weren’t expecting it, you can ignore this email.</p>
</td></tr>
</table></td></tr></table></body></html>`
  const text = `${textGreeting}

${input.inviterName} invited you to the Easner Website Admin as ${/^[aeiou]/i.test(input.roleLabel) ? "an" : "a"} ${input.roleLabel.toLowerCase()}. It's where the Easner blog is written and published.

Sign in: ${input.signInUrl}

Enter this email address (${input.to}) on the sign-in page and we send a 6-digit code. The first time, you also set up an authenticator app.

If you weren't expecting this, you can ignore this email.`
  return { html, text }
}

export type SendResult = { ok: true } | { ok: false; reason: "not-configured" | "failed"; message: string }

export async function sendInviteEmail(input: InviteEmail): Promise<SendResult> {
  const ses = sesClient()
  if (!ses) {
    return { ok: false, reason: "not-configured", message: "Email isn’t set up: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are missing." }
  }
  const { html, text } = renderInvite(input)
  const from = process.env.ADMIN_EMAIL_FROM?.trim() || "noreply@easner.com"
  const fromName = process.env.ADMIN_EMAIL_FROM_NAME?.trim() || "Easner Website Admin"
  const configurationSet = process.env.SES_CONFIGURATION_SET?.trim()
  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `${fromName} <${from}>`,
        Destination: { ToAddresses: [input.to] },
        ReplyToAddresses: [process.env.EMAIL_REPLY_TO?.trim() || "support@easner.com"],
        ...(configurationSet ? { ConfigurationSetName: configurationSet } : {}),
        Content: {
          Simple: {
            Subject: { Data: inviteSubject(), Charset: "UTF-8" },
            Body: { Html: { Data: html, Charset: "UTF-8" }, Text: { Data: text, Charset: "UTF-8" } },
          },
        },
      }),
    )
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: "failed", message: error instanceof Error ? error.message : "SES refused the message." }
  }
}
