import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FormSubmission from "@/models/Members";

// Types matching the new Schema
interface FormSubmissionBody {
  personalInfo: {
    regNumber: string;
    vitEmail: string;
    personalEmail: string;
    [key: string]: any;
  };
  domainInfo: {
    domain: string;
    [key: string]: any;
  };
  commitmentInfo: any;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const body = await req.json() as FormSubmissionBody;
    
    // Validate required sections
    if (!body.personalInfo || !body.domainInfo || !body.commitmentInfo) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required form sections (personalInfo, domainInfo, commitmentInfo)" 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check duplicates (RegNo)
    const existingReg = await FormSubmission.findOne({
      'personalInfo.regNumber': body.personalInfo.regNumber
    });
    if (existingReg) {
      return new Response(
        JSON.stringify({ success: false, error: "Registration number already submitted" }), 
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check duplicates
    const existingEmail = await FormSubmission.findOne({
        $or: [
            { 'personalInfo.vitEmail': body.personalInfo.vitEmail },
            { 'personalInfo.personalEmail': body.personalInfo.personalEmail }
        ]
    });
    if (existingEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "Email already submitted" }), 
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
    }

    // Create
    const formSubmission = await FormSubmission.create({
      ...body,
      submittedAt: new Date(),
      status: 'submitted'
    });

    return new Response(
      JSON.stringify({ success: true, data: formSubmission, message: "Submitted successfully!" }), 
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Submission error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Submission failed" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    const filter: any = {};
    if (status) filter.status = status;
    if (domain) filter['domainInfo.domain'] = domain;
    
    const skip = (page - 1) * limit;
    
    const formSubmissions = await FormSubmission.find(filter)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    const totalCount = await FormSubmission.countDocuments(filter);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: formSubmissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        }
      }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}