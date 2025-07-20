import { NextResponse, type NextRequest } from 'next/server';

// This is a mock response. You can replace this with your actual backend logic.
const mockResult = {
    functionalRequirements: [
        "User can log in with email and password.",
        "User can view a dashboard with key metrics.",
        "User can create a new project.",
        "The system shall generate a PDF report of project status."
    ],
    nonFunctionalRequirements: [
        "The application must be responsive and accessible on mobile devices.",
        "Page load times should not exceed 2 seconds on a standard internet connection.",
        "All sensitive user data must be encrypted at rest and in transit.",
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
