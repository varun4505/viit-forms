import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Members";
import { sendBirthdayEmail, sendBoardNotification } from "@/lib/mail";

async function handleBirthdayCheck(req: NextRequest) {
  // Check for Vercel's built-in cron authorization
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");
  const cronSecret = req.headers.get("x-cron-secret");
  
  // Allow if it's a Vercel cron request OR if manual request with correct secret
  if (!isVercelCron && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, message: "Not authorized" },
      { status: 401 }
    );
  }

  try {
    console.log('🔍 Starting birthday check...');
    await dbConnect();
    console.log('✅ Database connected successfully');

    // Get current date in IST (UTC+5:30)
    const now = new Date();
    const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const month = istDate.getMonth() + 1;
    const day = istDate.getDate();         // Use getDate() instead of getUTCDate()        

    console.log(`🗓️ Checking for birthdays on: ${month}/${day}`);

    const todaysBirthdays = await Member.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$personalInfo.dob" }, month] },
          { $eq: [{ $dayOfMonth: "$personalInfo.dob" }, day] }
        ]
      }
    });

    console.log(`Found ${todaysBirthdays.length} birthdays today`);

    const emailResults = await Promise.all(
      todaysBirthdays.map(async (member) => {
        console.log(`📧 Processing birthday for: ${member.personalInfo.name}`);
        
        // TWEAK: Pass all details required by the updated mail.ts
        const emailData = {
            name: member.personalInfo.name,
            email: member.personalInfo.vitEmail,
            phoneNumber: member.personalInfo.phoneNumber,
            regNumber: member.personalInfo.regNumber,
            birthdate: member.personalInfo.dob
        };
        
        try {
          const memberEmailSent = await sendBirthdayEmail(emailData);
          const boardEmailSent = await sendBoardNotification(emailData);
          
          return {
              name: member.personalInfo.name,
              memberEmailSent,
              boardEmailSent,
          };
        } catch (emailError) {
          console.error(`❌ Error sending emails for ${member.personalInfo.name}:`, emailError);
          return {
              name: member.personalInfo.name,
              memberEmailSent: false,
              boardEmailSent: false,
              error: (emailError as Error).message
          };
        }
      })
    );

    console.log('✅ Birthday check completed successfully');
    
    return NextResponse.json({
      success: true,
      message: "Birthday check completed",
      results: emailResults,
    });
  } catch (error) {
    console.error("❌ Birthday check error:", error);
    console.error("Error stack:", (error as Error).stack);
    
    return NextResponse.json(
      {
        success: false,
        message: "Error checking birthdays",
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}

// Export both GET and POST handlers for flexibility
export async function GET(req: NextRequest) {
  return handleBirthdayCheck(req);
}

export async function POST(req: NextRequest) {
  return handleBirthdayCheck(req);
}
