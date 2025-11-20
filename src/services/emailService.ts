
import emailjs from '@emailjs/browser';

// Replace with your actual EmailJS Service ID, Template ID, and Public Key
// In a real app, these should be in environment variables
const SERVICE_ID = 'service_6va0rq5';
const TEMPLATE_ID = 'template_nou38vs';
const PUBLIC_KEY = '7UidqJrbgoP8kzDAX';

export const initEmailService = () => {
  emailjs.init(PUBLIC_KEY);
};

export const sendEmail = async (toName: string, toEmail: string, subject: string, message: string) => {
  try {
    const templateParams = {
      to_name: toName,
      to_email: toEmail,
      subject: subject,
      message: message,
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Email sent successfully!', response.status, response.text);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, message: 'Failed to send email.' };
  }
};

export const sendBulkEmail = async (recipients: { name: string; email: string }[], subject: string, message: string) => {
  const results = await Promise.all(
    recipients.map((recipient) => sendEmail(recipient.name, recipient.email, subject, message))
  );

  const successCount = results.filter((r) => r.success).length;
  return {
    success: successCount === recipients.length,
    message: `Sent ${successCount} of ${recipients.length} emails.`,
  };
};
