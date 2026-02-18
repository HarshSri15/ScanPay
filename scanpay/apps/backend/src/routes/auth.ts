import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// In-memory OTP store (use Redis in production)
const otpStore: Record<string, { otp: string; name: string; expires: number }> = {};

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, name } = req.body;

  if (!phone || !name) {
    res.status(400).json({ error: 'Phone and name are required' });
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[phone] = { otp, name, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

  // In production: send via Twilio, MSG91, etc.
  // await twilioClient.messages.create({ body: `Your ScanPay OTP: ${otp}`, from: '+1...', to: `+91${phone}` });

  console.log(`📱 OTP for ${phone}: ${otp}`); // REMOVE IN PRODUCTION

  res.json({ success: true, message: 'OTP sent successfully' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ error: 'Phone and OTP are required' });
    return;
  }

  const record = otpStore[phone];

  if (!record) {
    res.status(401).json({ error: 'OTP not found. Please request a new one.' });
    return;
  }

  if (Date.now() > record.expires) {
    delete otpStore[phone];
    res.status(401).json({ error: 'OTP expired. Please request a new one.' });
    return;
  }

  if (record.otp !== otp) {
    res.status(401).json({ error: 'Invalid OTP' });
    return;
  }

  // OTP valid — clean up
  const name = record.name;
  delete otpStore[phone];

  // Upsert user
  const user = await User.findOneAndUpdate(
    { phone },
    { phone, name },
    { upsert: true, new: true }
  );

  const accessToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  res.json({
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
    },
  });
});

// GET /api/auth/me — get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { id: user._id.toString(), name: user.name, phone: user.phone } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
