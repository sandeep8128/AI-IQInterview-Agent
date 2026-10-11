const nodemailer = require("nodemailer");

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is missing");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"InterviewIQ.AI" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Reset your InterviewIQ.AI password",
    text: `Password reset ke liye is link ko open karein:\n${resetUrl}\n\nYe link 15 minutes tak valid rahega.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#111827">
        <h2 style="color:#6d28d9">InterviewIQ.AI</h2>
        <h3>Reset Your Password</h3>
        <p>Aapne password reset request ki hai.</p>
        <p>Naya password set karne ke liye neeche click karein:</p>
        <a href="${resetUrl}"
           style="background:#6d28d9;color:white;padding:13px 22px;text-decoration:none;border-radius:8px;display:inline-block">
          Reset Password
        </a>
        <p>Security ke liye link 15 minutes mein expire ho jayega.</p>
        <p>Agar aapne request nahi ki thi, toh is email ko ignore kar dein.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
