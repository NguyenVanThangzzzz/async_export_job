import nodemailer, { SendMailOptions } from 'nodemailer';

import { logger } from './logger.js';

const createTransport = async () => {
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: SendMailOptions) => {
  const transport = await createTransport();

  const info = await transport.sendMail(options);

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    logger.info({ previewUrl }, 'Email preview');
  }

  return info;
};
