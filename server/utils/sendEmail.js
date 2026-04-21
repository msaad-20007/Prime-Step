import nodemailer from 'nodemailer';

const isConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const send = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.log(`[Email] SMTP not configured — skipping: "${subject}" to ${to}`);
    return;
  }
  await getTransporter().sendMail({
    from: `"PRIME STEP" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`[Email] Sent "${subject}" → ${to}`);
};

// ─── Shared layout ────────────────────────────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html><html>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#121212;border-radius:12px;overflow:hidden;border:1px solid #222;">
  <div style="padding:28px 32px 0;text-align:center;">
    <h1 style="color:#D4FF14;font-size:26px;letter-spacing:6px;margin:0;">PRIME STEP</h1>
  </div>
  <div style="padding:32px;">${content}</div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#4b5563;font-size:11px;margin:0;">© 2025 PRIME STEPury Shoe Store</p>
  </div>
</div>
</body></html>`;

const btn = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#D4FF14;color:#000;font-weight:bold;padding:13px 30px;border-radius:8px;text-decoration:none;font-size:13px;letter-spacing:2px;">${label}</a>`;

const h2 = (text) => `<h2 style="color:#F3F4F6;font-size:20px;margin:0 0 12px;">${text}</h2>`;
const p = (text) => `<p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 16px;">${text}</p>`;

// ─── OTP Verification ─────────────────────────────────────────────────────────
export const sendOtpEmail = async ({ email, otp }) => {
  await send({
    to: email,
    subject: `${otp} is your PRIME STEP verification code`,
    html: layout(`
      ${h2('Verify your email address')}
      ${p('Enter this code to complete your registration. It expires in <strong style="color:#F3F4F6;">10 minutes</strong>.')}
      <div style="text-align:center;margin:28px 0;">
        <div style="display:inline-block;background:#050505;border:2px solid #D4FF14;border-radius:12px;padding:18px 40px;">
          <span style="color:#D4FF14;font-size:36px;font-weight:900;letter-spacing:10px;">${otp}</span>
        </div>
      </div>
      ${p('If you did not request this, you can safely ignore this email.')}
    `),
  });
};

// ─── Welcome ──────────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async ({ name, email }) => {
  await send({
    to: email,
    subject: '🎉 Welcome to PRIME STEPury Shoe Store',
    html: layout(`
      ${h2(`Welcome, ${name}! 👟`)}
      ${p("Your account is verified and ready. You're now part of the PRIME STEPury family.")}
      ${p('Start exploring our exclusive collection of premium footwear.')}
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/shop`, 'SHOP NOW')}</div>
    `),
  });
};

// ─── Order Placed ─────────────────────────────────────────────────────────────
export const sendOrderPlacedEmail = async ({ name, email, orderId, items, total }) => {
  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 0;color:#F3F4F6;font-size:13px;">${i.name} — Size ${i.size}</td>
      <td style="padding:8px 0;color:#D4FF14;font-size:13px;text-align:right;">×${i.qty} &nbsp; $${(i.price * i.qty).toFixed(2)}</td>
    </tr>`
  ).join('')

  await send({
    to: email,
    subject: `✅ Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      ${h2(`Order Confirmed, ${name}!`)}
      ${p(`Your order <strong style="color:#F3F4F6;">#${orderId.slice(-8).toUpperCase()}</strong> has been placed successfully.`)}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td colspan="2" style="border-bottom:1px solid #333;padding-bottom:8px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Items</td></tr>
        ${itemRows}
        <tr><td colspan="2" style="border-top:1px solid #333;padding-top:12px;"></td></tr>
        <tr>
          <td style="color:#F3F4F6;font-weight:bold;font-size:14px;">Total Paid</td>
          <td style="color:#D4FF14;font-weight:bold;font-size:16px;text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile`, 'TRACK ORDER')}</div>
    `),
  });
};

// ─── Payment Confirmed ────────────────────────────────────────────────────────
export const sendPaymentConfirmedEmail = async ({ name, email, orderId, total }) => {
  await send({
    to: email,
    subject: `💳 Payment Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      ${h2('Payment Received!')}
      ${p(`Hi ${name}, we've received your payment of <strong style="color:#D4FF14;">$${total.toFixed(2)}</strong> for order <strong style="color:#F3F4F6;">#${orderId.slice(-8).toUpperCase()}</strong>.`)}
      ${p("We're now preparing your order. You'll receive another update when it ships.")}
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile`, 'VIEW ORDER')}</div>
    `),
  });
};

// ─── Order Processing ─────────────────────────────────────────────────────────
export const sendOrderProcessingEmail = async ({ name, email, orderId }) => {
  await send({
    to: email,
    subject: `⚙️ Your Order is Being Processed — #${orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      ${h2('Your Order is Being Processed')}
      ${p(`Hi ${name}, great news! Order <strong style="color:#F3F4F6;">#${orderId.slice(-8).toUpperCase()}</strong> is now being processed by our team.`)}
      ${p("We're picking and packing your items. You'll get a shipping notification soon.")}
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile`, 'VIEW ORDER')}</div>
    `),
  });
};

// ─── Order Shipped ────────────────────────────────────────────────────────────
export const sendOrderShippedEmail = async ({ name, email, orderId }) => {
  await send({
    to: email,
    subject: `🚚 Your Order Has Shipped — #${orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      ${h2("Your Order is On Its Way! 🚚")}
      ${p(`Hi ${name}, order <strong style="color:#F3F4F6;">#${orderId.slice(-8).toUpperCase()}</strong> has been shipped and is on its way to you.`)}
      ${p('Track your delivery status anytime from your profile page.')}
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile`, 'TRACK SHIPMENT')}</div>
    `),
  });
};

// ─── Order Delivered ──────────────────────────────────────────────────────────
export const sendOrderDeliveredEmail = async ({ name, email, orderId }) => {
  await send({
    to: email,
    subject: `📦 Order Delivered — #${orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      ${h2('Your Order Has Been Delivered! 📦')}
      ${p(`Hi ${name}, order <strong style="color:#F3F4F6;">#${orderId.slice(-8).toUpperCase()}</strong> has been delivered.`)}
      ${p('We hope you love your new kicks! If you have any issues, please contact our support.')}
      <div style="margin-top:24px;">${btn(`${process.env.CLIENT_URL || 'http://localhost:5173'}/shop`, 'SHOP MORE')}</div>
    `),
  });
};
