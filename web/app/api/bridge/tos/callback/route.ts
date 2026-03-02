import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"

/**
 * GET /api/bridge/tos/callback
 * Callback endpoint for Bridge TOS redirect_uri
 * Bridge redirects here with signed_agreement_id in query params after user accepts TOS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signedAgreementId = searchParams.get("signed_agreement_id")
    const userId = searchParams.get("userId")
    const error = searchParams.get("error")

    // Handle error case
    if (error) {
      console.error("[TOS-CALLBACK] Bridge returned error:", error)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Terms of Service - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
              }
              h1 { color: #dc2626; margin: 0 0 1rem 0; }
              p { color: #666; margin: 0.5rem 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p>There was an error accepting the Terms of Service.</p>
              <p>Please try again or contact support.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      )
    }

    // Validate required parameters
    if (!signedAgreementId) {
      console.error("[TOS-CALLBACK] Missing signed_agreement_id in callback")
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Terms of Service - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
              }
              h1 { color: #dc2626; margin: 0 0 1rem 0; }
              p { color: #666; margin: 0.5rem 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p>Missing signed_agreement_id. Please try again.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      )
    }

    if (!userId) {
      console.error("[TOS-CALLBACK] Missing userId in callback")
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Terms of Service - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
              }
              h1 { color: #dc2626; margin: 0 0 1rem 0; }
              p { color: #666; margin: 0.5rem 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p>Missing user ID. Please try again.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      )
    }

    console.log(`[TOS-CALLBACK] Processing TOS callback for user ${userId} with signed_agreement_id: ${signedAgreementId.substring(0, 8)}...`)

    const supabase = createServerClient()

    // Store signed_agreement_id in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        bridge_signed_agreement_id: signedAgreementId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("[TOS-CALLBACK] Error storing signed_agreement_id:", updateError)
      // Still show success page - the signed_agreement_id is valid even if storage fails
    } else {
      console.log(`[TOS-CALLBACK] Successfully stored signed_agreement_id for user ${userId}`)
    }

    // If user has a Bridge customer, update it with signed_agreement_id
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id")
      .eq("id", userId)
      .single()

    if (userProfile?.bridge_customer_id) {
      try {
        console.log(`[TOS-CALLBACK] Updating Bridge customer ${userProfile.bridge_customer_id} with signed_agreement_id`)
        await bridgeService.updateCustomerTOS(userProfile.bridge_customer_id, signedAgreementId)
        console.log(`[TOS-CALLBACK] Successfully updated Bridge customer`)
      } catch (customerError: any) {
        console.error(`[TOS-CALLBACK] Error updating Bridge customer:`, customerError.message)
        // Don't fail - TOS is signed, customer update can happen later
      }
    }

    // Return success page (for web browser redirects)
    // Mobile app will handle this via WebView navigation
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Terms of Service - Accepted</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #10b981; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0.5rem 0; }
            .checkmark {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Terms Accepted</h1>
            <p>Your Terms of Service have been accepted successfully.</p>
            <p>You can now close this window and return to the app.</p>
          </div>
          <script>
            // For mobile WebView - send postMessage with signedAgreementId
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                signedAgreementId: '${signedAgreementId}'
              }))
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    )
  } catch (error: any) {
    console.error("[TOS-CALLBACK] Error processing callback:", error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Terms of Service - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0.5rem 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>An error occurred processing your Terms of Service acceptance.</p>
            <p>Please try again or contact support.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    )
  }
}

