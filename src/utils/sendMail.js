import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { config } from '../configs/app.config.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

const renderEmailTemplate = async (templateName, data) => {
  const templatePath = path.join(
    __dirname,
    'email-templates',
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (to, subject, templateName, data) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    await transporter.sendMail({
      from: `"Learnverrse" <${config.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    return false;
  }
};
