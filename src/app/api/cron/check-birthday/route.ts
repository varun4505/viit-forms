import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Members";
import { sendBirthdayEmail, sendBoardNotification } from "@/lib/mail";

async function handleBirthdayCheck(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, message: "Not authorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    // Get current date in IST (UTC+5:30)
    const today = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(today.getTime() + istOffset);
    const month = istDate.getUTCMonth() + 1; 
    const day = istDate.getUTCDate();        

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
        // TWEAK: Pass all details required by the updated mail.ts
        const emailData = {
            name: member.personalInfo.name,
            email: member.personalInfo.vitEmail,
            phoneNumber: member.personalInfo.phoneNumber,
            regNumber: member.personalInfo.regNumber,
            birthdate: member.personalInfo.dob
        };
        
        return {
            name: member.personalInfo.name,
            memberEmailSent: await sendBirthdayEmail(emailData),
            boardEmailSent: await sendBoardNotification(emailData),
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "Birthday check completed",
      results: emailResults,
    });
  } catch (error) {
    console.error("Birthday check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking birthdays",
        error: (error as Error).message,
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
