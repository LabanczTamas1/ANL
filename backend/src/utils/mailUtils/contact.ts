import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { createLogger } from '../logger.js';
import { execute } from '../db.js';

const logger = createLogger('contact', 'controller');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
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
    await execute(
      `INSERT INTO contact_submissions (id, full_name, email, message) VALUES ($1, $2, $3, $4)`,
      [uuidv4(), fullName, email, message],
    );

    const mailOptions = {
      from: email,
      to: 'deid.unideb@gmail.com',
      subject: `New Contact Form Submission - ${fullName}`,
      text: `You have received a new contact form submission:\n\nName: ${fullName}\nEmail: ${email}\nMessage: ${message}\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Contact form submitted and email sent successfully.' });
  } catch (err) {
    logger.error({ err }, 'Contact form error');
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
