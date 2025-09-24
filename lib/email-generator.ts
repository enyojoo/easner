// Email template generator using the provided design system

export function generateBaseEmailTemplate(
  title: string,
  subtitle: string,
  content: string,
  ctaButton?: { text: string; url: string }
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Easner</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #ffffff;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        .email-header {
            background: #ffffff;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 20px auto;
            display: block;
        }
        
        .email-title {
            color: #007ACC;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .email-subtitle {
            color: #4a5568;
            font-size: 16px;
            font-weight: 400;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            color: #1a202c;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .confirmation-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #007ACC 0%, #0056b3 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 122, 204, 0.4);
        }
        
        .security-note {
            background-color: #f7fafc;
            border-left: 4px solid #007ACC;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note h3 {
            color: #2d3748;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .security-note p {
            color: #4a5568;
            font-size: 14px;
            margin: 0;
        }
        
        .email-footer {
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            color: #718096;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .footer-links {
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #007ACC;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .company-info {
            color: #a0aec0;
            font-size: 12px;
            margin-top: 20px;
        }
        
        .transaction-details {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .transaction-details h3 {
            color: #2d3748;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
        }
        
        .detail-label {
            color: #4a5568;
            font-weight: 500;
        }
        
        .detail-value {
            color: #1a202c;
            font-weight: 600;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .status-processing {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .status-completed {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .status-failed {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .status-cancelled {
            background-color: #f3f4f6;
            color: #374151;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0a0a0a;
                color: #e5e5e5;
            }
            
            .email-container {
                background-color: #1a1a1a;
                border-color: #333333;
            }
            
            .email-header {
                background: #1a1a1a;
                border-bottom-color: #333333;
            }
            
            .email-title {
                color: #007ACC;
            }
            
            .email-subtitle {
                color: #999999;
            }
            
            .welcome-text {
                color: #ffffff;
            }
            
            .confirmation-text {
                color: #e5e5e5;
            }
            
            .security-note {
                background-color: #2a2a2a;
                border-left-color: #007ACC;
            }
            
            .security-note h3 {
                color: #ffffff;
            }
            
            .security-note p {
                color: #e5e5e5;
            }
            
            .email-footer {
                background-color: #1a1a1a;
                border-top-color: #333333;
            }
            
            .footer-text {
                color: #999999;
            }
            
            .footer-links a {
                color: #007ACC;
            }
            
            .company-info {
                color: #666666;
            }
            
            .transaction-details {
                background-color: #2a2a2a;
                border-color: #333333;
            }
            
            .transaction-details h3 {
                color: #ffffff;
            }
            
            .detail-label {
                color: #999999;
            }
            
            .detail-value {
                color: #ffffff;
            }
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-title {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .welcome-text {
                font-size: 16px;
            }
            
            .confirmation-text {
                font-size: 15px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
                padding: 18px 20px;
                font-size: 16px;
            }
            
            .email-footer {
                padding: 25px 20px;
            }
            
            .footer-links a {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <img src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/EASNER.png" alt="Easner Logo" class="logo">
            <h1 class="email-title">${title}</h1>
            <p class="email-subtitle">${subtitle || "Cross-border transfers in under 5 minutes"}</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            ${content}
            
            ${ctaButton ? `
            <div style="text-align: center;">
                <a href="${ctaButton.url}" class="cta-button">${ctaButton.text}</a>
            </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                Need help? We're here for you!
            </p>
            
            <div class="footer-links">
                <a href="mailto:support@easner.com">Contact Support</a>
            </div>
            
            <p class="company-info">
                © 2025 Easner, Inc. All rights reserved.<br>
                28 Geary St Ste 650, San Francisco, CA 94108<br>
                You received this email because you have an Easner account.
            </p>
        </div>
    </div>
</body>
</html>
  `
}

export function generateTransactionDetails(data: any): string {
  return `
    <div class="transaction-details">
      <h3>Transaction Details</h3>
      <div class="detail-row">
        <span class="detail-label">Transaction ID:</span>
        <span class="detail-value">${data.transactionId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Recipient:</span>
        <span class="detail-value">${data.recipientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount:</span>
        <span class="detail-value">${data.sendAmount} ${data.sendCurrency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Receiving:</span>
        <span class="detail-value">${data.receiveAmount} ${data.receiveCurrency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Exchange Rate:</span>
        <span class="detail-value">1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fee:</span>
        <span class="detail-value">${data.fee} ${data.sendCurrency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge status-${data.status}">${data.status}</span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${new Date(data.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `
}

export function generateFooter(): string {
  return `
    <p class="footer-text">
      Need help? We're here for you!
    </p>
    
    <div class="footer-links">
      <a href="mailto:support@easner.com">Contact Support</a>
    </div>
    
    <p class="company-info">
      © 2025 Easner, Inc. All rights reserved.<br>
      28 Geary St Ste 650, San Francisco, CA 94108<br>
      You received this email because you have an Easner account.
    </p>
  `
}
