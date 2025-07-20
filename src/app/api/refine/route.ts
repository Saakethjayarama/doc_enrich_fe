import { NextResponse, type NextRequest } from 'next/server';

// This is a mock response. You can replace this with your actual backend logic.
const mockResult = {
    enhanced_requirement_functional: [
        "The system shall provide a search bar that allows students to find courses by title, instructor, category, or keywords.",
        "The system shall allow students to enroll in courses and track their progress through modules and lessons.",
        "The system shall support various content formats, including video lectures (MP4), PDF documents, interactive quizzes (SCORM compliant), and discussion forums.",
        "The system shall enable instructors to upload course materials, create assignments, and provide feedback to students.",
        "The system shall generate certificates of completion for students who successfully finish a course."
    ],
    enhanced_requirement_non_functional: [
        {
            "type": "Performance",
            "description": "The system shall load course content pages within 2 seconds for up to 1000 concurrent users."
        },
        {
            "type": "Usability",
            "description": "The user interface shall be designed to be intuitive, enabling students to navigate to any course content within 3 clicks from the dashboard."
        },
        {
            "type": "Scalability",
            "description": "The system shall support up to 50,000 active student accounts and 1,000 concurrent instructors without performance degradation."
        },
        {
            "type": "Reliability",
            "description": "The system shall have an uptime of 99.9% excluding scheduled maintenance."
        },
        {
            "type": "Security",
            "description": "The system shall encrypt all sensitive user data, including personal information and payment details, using AES-256 encryption."
        }
    ],
    clarificationNeeded: [
        { field: "User Authentication", reason: "The document mentions 'user login' but doesn't specify authentication methods like OAuth (Google, GitHub) or only email/password." },
        { field: "Reporting Feature", reason: "The requirements state 'generate reports' but do not specify the format (PDF, CSV, etc.) or the data to be included." }
    ]
};


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files = body.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    // --- TODO: Add your backend logic here ---
    // You can process the files which are available as data URIs.
    // For example: `const data = files[0].dataUri;`
    console.log(`Received ${files.length} files for processing.`);

    // Returning mock data for now.
    const result = mockResult;
    // -----------------------------------------

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to process requirements: ${errorMessage}` }, { status: 500 });
  }
}
