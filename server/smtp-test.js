require('dotenv').config();
const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || '465';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
const FROM_EMAIL = process.env.FROM_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !ADMIN_EMAIL) {
  console.error('Missing one or more SMTP environment variables. Copy .env.example to .env and fill values.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

async function run() {
  try {
    console.log('Verifying SMTP transporter...');
    await transporter.verify();
    console.log('SMTP transporter verified. Sending test email to', ADMIN_EMAIL);

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: 'SiddhiAqua SMTP test',
      text: 'This is a test email from SiddhiAqua application.',
    });

    console.log('Test email sent. Message ID:', info.messageId);
  } catch (err) {
    console.error('SMTP test failed:', err);
    process.exit(1);
  }
}

run();
