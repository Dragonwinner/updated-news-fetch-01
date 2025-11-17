import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Welcome to News Domain Generator',
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thank you for registering with News Domain Generator.</p>
          <p>You can now access premium domain suggestions generated from daily news.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  /**
   * Send domain availability alert
   */
  async sendDomainAvailabilityAlert(
    email: string,
    domainName: string,
    price?: number
  ): Promise<void> {
    try {
      const priceText = price ? `Price: $${price}` : '';
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: `Domain Available: ${domainName}`,
        html: `
          <h1>Domain Alert</h1>
          <p>The domain <strong>${domainName}</strong> is now available!</p>
          ${priceText ? `<p>${priceText}</p>` : ''}
          <p>Login to your account to learn more.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending domain alert email:', error);
    }
  }

  /**
   * Send price change alert
   */
  async sendPriceChangeAlert(
    email: string,
    domainName: string,
    oldPrice: number,
    newPrice: number
  ): Promise<void> {
    try {
      const change = newPrice > oldPrice ? 'increased' : 'decreased';
      const changeAmount = Math.abs(newPrice - oldPrice);
      
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: `Price Alert: ${domainName}`,
        html: `
          <h1>Price Change Alert</h1>
          <p>The price for <strong>${domainName}</strong> has ${change}!</p>
          <p>Old Price: $${oldPrice}</p>
          <p>New Price: $${newPrice}</p>
          <p>Change: $${changeAmount}</p>
        `,
      });
    } catch (error) {
      console.error('Error sending price alert email:', error);
    }
  }

  /**
   * Send generic notification
   */
  async sendNotification(
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: subject,
        html: message,
      });
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}
