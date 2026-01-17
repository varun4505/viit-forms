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
  // Randomly select a birthday image
  const birthdayImages = ['1.png', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg'];
  const randomImage = birthdayImages[Math.floor(Math.random() * birthdayImages.length)];
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/birthday/${randomImage}`;

  // Random text variations
  const greetings = [
    `Happy Birthday, ${member.name}! 🎉`,
    `Wishing you a fantastic birthday, ${member.name}! 🎂`,
    `It's your special day, ${member.name}! 🎈`,
    `Many happy returns, ${member.name}! 🌟`,
    `Celebrating you today, ${member.name}! 🎊`
  ];

  const wishMessages = [
    "We hope your day is filled with joy and celebration!",
    "May your birthday be as wonderful as you are!",
    "Wishing you happiness, laughter, and all your heart desires!",
    "Hope your special day brings you lots of joy and sweet surprises!",
    "May this new year of life bring you endless opportunities and happiness!"
  ];

  const appreciationMessages = [
    "Thank you for being a valuable member of our club.",
    "We're grateful to have you as part of the VinnovateIT family.",
    "Your contribution to our community makes a real difference.",
    "It's members like you who make VinnovateIT such a special place.",
    "We appreciate your dedication and enthusiasm in everything you do."
  ];

  const closingMessages = [
    "Best wishes from VinnovateIT!",
    "With love from the VinnovateIT!",
    "Celebrating you from all of us at VinnovateIT!",
    "Warmest birthday wishes from VinnovateIT!",
    "Have an amazing day from everyone at VinnovateIT!"
  ];

  // Randomly select messages
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const randomWish = wishMessages[Math.floor(Math.random() * wishMessages.length)];
  const randomAppreciation = appreciationMessages[Math.floor(Math.random() * appreciationMessages.length)];
  const randomClosing = closingMessages[Math.floor(Math.random() * closingMessages.length)];

  const mailOptions = {
    from: `"VinnovateIT" <${process.env.EMAIL_FROM as string}>`,
    to: member.email,
    subject: "🎂 Happy Birthday!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${imageUrl}" alt="Happy Birthday" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
        </div>
        <h1 style="color: #3b82f6; text-align: center;">${randomGreeting}</h1>
        <p style="font-size: 16px; line-height: 1.5;">${randomWish}</p>
        <p style="font-size: 16px; line-height: 1.5;">${randomAppreciation}</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">${randomClosing}</p>
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
