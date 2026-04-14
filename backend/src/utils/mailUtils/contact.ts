import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import { getRedisClient } from '../../config/database.js';
import { env } from '../../config/env.js';
import { createLogger } from '../logger.js';

const logger = createLogger('contact', 'controller');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: env.SMTP_USER || 'deid.unideb@gmail.com',
    pass: env.SMTP_PASS || '',
  },
});

export async function handleContactSubmission(
  req: Request,
  res: Response,
): Promise<void> {
  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  try {
    const redisClient = getRedisClient();
    const date = new Date().toISOString().split('T')[0];
    const hashKey = `contact:${date}`;
    const entryId = uuidv4();

    await redisClient.hSet(
      hashKey,
      entryId,
      JSON.stringify({
        fullName,
        email,
        message,
        timestamp: new Date().toISOString(),
      }),
    );

    const mailOptions = {
      from: email,
      to: 'deid.unideb@gmail.com',
      subject: `New Contact Form Submission - ${fullName}`,
      text: `You have received a new contact form submission:\n\nName: ${fullName}\nEmail: ${email}\nMessage: ${message}\n`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: 'Contact form submitted and email sent successfully.' });
  } catch (err) {
    logger.error({ err }, 'Contact form error');
    res
      .status(500)
      .json({ error: 'Internal server error. Please try again later.' });
  }
}
