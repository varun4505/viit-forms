import nodemailer, { Transporter } from "nodemailer";

interface Member {
  name: string;
  email: string;
  phoneNumber?: string;
  regNumber?: string;
  birthdate?: Date;
}

// Configure mail transporter
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST as string,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

// Function to send birthday email to a member
export async function sendBirthdayEmail(member: Member): Promise<boolean> {
  const mailOptions = {
    from: `"VinnovateIT" <${process.env.EMAIL_FROM as string}>`,
    to: member.email,
    subject: "🎂 Happy Birthday!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #3b82f6; text-align: center;">Happy Birthday, ${member.name}! 🎉</h1>
        <p style="font-size: 16px; line-height: 1.5;">We hope your day is filled with joy and celebration!</p>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for being a valuable member of our club.</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">Best wishes from VinnovateIT!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Birthday email sent to ${member.name} at ${member.email}`);
    return true;
  } catch (error) {
    console.error("Error sending birthday email:", error);
    return false;
  }
}

// Function to send a birthday notification to board members
export async function sendBoardNotification(member: Member): Promise<boolean> {
  const boardEmails = (process.env.BOARD_EMAILS as string)?.split(",") || [];

  if (!boardEmails.length) {
    console.error("No board emails configured.");
    return false;
  }

  const mailOptions = {
    from: `" VinnovateIT" <${process.env.EMAIL_FROM as string}>`,
    to: boardEmails.join(","),
    subject: `🎂 Birthday Reminder: ${member.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3b82f6;">Birthday Reminder</h2>
        <p style="font-size: 16px; line-height: 1.5;">Today is <strong>${member.name}'s</strong> birthday!</p>
        <p style="font-size: 16px; line-height: 1.5;">Member details:</p>
        <ul style="font-size: 16px; line-height: 1.5;">
          <li><strong>Name:</strong> ${member.name}</li>
          <li><strong>Email:</strong> ${member.email}</li>
          <li><strong>Phone:</strong> ${member.phoneNumber || "N/A"}</li>
          <li><strong>Registration No:</strong> ${member.regNumber || "N/A"}</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.5;">Don't forget to wish them a happy birthday!</p>
        <p style="font-size: 14px; color: #666; margin-top: 20px;">This is an automated message from VinnovateIT Management System.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Board notification sent about ${member.name}'s birthday`);
    return true;
  } catch (error) {
    console.error("Error sending board notification:", error);
    return false;
  }
}
