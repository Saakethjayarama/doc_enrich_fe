
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { UploadCloud, FileText, FileAudio, X, Loader2, Lightbulb, CheckCircle, Wand2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from './ui/scroll-area';

type Status = 'idle' | 'reading' | 'processing' | 'success' | 'error';

type RefineResult = {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  clarificationNeeded?: { field: string, reason: string }[];
  error?: string;
};

const allowedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-m4a': ['.m4a'],
    'audio/m4a': ['.m4a'],
};

// --- Mock Data and Functions ---

const mockClarificationSuggestions = [
    "Could you specify the target user roles (e.g., admin, guest, authenticated user)?",
    "What are the expected peak and average load times for the system?",
    "Which specific payment gateways should be integrated?",
    "Define the exact data points that need to be included in the monthly report.",
];

const mockResult: RefineResult = {
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

const refineRequirementsAction = async (input: { files: { name: string, dataUri: string }[] }): Promise<RefineResult> => {
  console.log('Mock refineRequirementsAction called with:', input);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockResult);
    }, 2000); // Simulate network delay
  });
};

const suggestClarificationAction = async (input: { requirements: string }): Promise<{ clarificationSuggestions: string[], error?: string }> => {
  console.log('Mock suggestClarificationAction called with:', input);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ clarificationSuggestions: mockClarificationSuggestions });
    }, 1000); // Simulate network delay
  });
};


// --- Helper Components ---

const RequirementSection = ({ title, requirements, icon: Icon, emptyText }: { title: string, requirements: string[], icon: React.ElementType, emptyText: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-3">
            <Icon className="w-6 h-6 text-primary" />
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {requirements.length > 0 ? (
                <ul className="space-y-3">
                    {requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                            <span>{req}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">{emptyText}</p>
            )}
        </CardContent>
    </Card>
);

const ClarificationSuggester = ({ requirement }: { requirement: string }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSuggest = async () => {
        if (suggestions.length > 0) return; // Don't re-fetch if already loaded

        setIsLoading(true);
        setError(null);
        const result = await suggestClarificationAction({ requirements: requirement });
        if (result.error) {
            setError(result.error);
        } else {
            setSuggestions(result.clarificationSuggestions || []);
        }
        setIsLoading(false);
    };
    
    // We use useEffect to fetch suggestions when the dialog is opened
    // to avoid sending a request for every item in the list upfront.
    useEffect(() => {
        if(isOpen) {
            handleSuggest();
        }
    }, [isOpen]);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Suggest Clarifications
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Clarification Suggestions</AlertDialogTitle>
                    <AlertDialogDescription>
                        Here are some AI-powered suggestions to make the requirement clearer:
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60">
                  <ScrollArea className="h-full pr-4">
                    {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
                    {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {!isLoading && !error && (
                        <ul className="space-y-2">
                            {suggestions.map((s, i) => <li key={i} className="text-sm">{s}</li>)}
                        </ul>
                    )}
                  </ScrollArea>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const ClarificationSection = ({ clarifications }: { clarifications?: { field: string, reason: string }[] }) => {
    if (!clarifications || clarifications.length === 0) return null;

    return (
        <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center gap-3">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                <CardTitle className="text-amber-700">Clarifications Needed</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-muted-foreground">The AI needs more information on the following points to provide accurate requirements.</p>
                <ul className="space-y-4">
                    {clarifications.map((item, index) => (
                        <li key={index} className="p-4 bg-background rounded-lg border">
                            <p className="font-semibold">{item.field}</p>
                            <p className="text-muted-foreground mb-2">{item.reason}</p>
                            <ClarificationSuggester requirement={item.reason} />
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

// --- Main Component ---

export function RequirementRefiner() {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<Status>('idle');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<RefineResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const { toast } = useToast();

    const handleFileChange = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(
            (file) => !files.some((existingFile) => existingFile.name === file.name)
        );
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }, [files]);

    const removeFile = (fileToRemove: File) => {
        setFiles(files.filter(file => file !== fileToRemove));
    };

    const handleReset = () => {
        setFiles([]);
        setStatus('idle');
        setProgress(0);
        setResult(null);
        setError(null);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            toast({
                title: "No files selected",
                description: "Please upload at least one file.",
                variant: "destructive",
            });
            return;
        }

        setStatus('reading');
        setError(null);
        setResult(null);

        try {
            const fileData = await Promise.all(
                files.map((file, index) =>
                    new Promise<{ name: string; dataUri: string }>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            setProgress(((index + 1) / files.length) * 100);
                            resolve({ name: file.name, dataUri: event.target?.result as string });
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    })
                )
            );

            setStatus('processing');
            const response = await refineRequirementsAction({ files: fileData });

            if (response.error) {
                throw new Error(response.error);
            }
            
            setResult(response);
            setStatus('success');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during file processing.';
            setError(errorMessage);
            setStatus('error');
        }
    };
    
    const dropzoneCallbacks = {
        onDrop: handleFileChange,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
    };
    const { getRootProps, getInputProps } = useMemo(() => ({
        getRootProps: (props?: any) => ({
            ...props,
            onDrop: (event: React.DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
                dropzoneCallbacks.onDrop(Array.from(event.dataTransfer.files));
                setIsDragActive(false);
            },
            onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
            },
            onDragEnter: (event: React.DragEvent<HTMLDivElement>) => {
                 event.preventDefault();
                 event.stopPropagation();
                 dropzoneCallbacks.onDragEnter();
            },
            onDragLeave: (event: React.DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
                dropzoneCallbacks.onDragLeave();
            },
        }),
        getInputProps: (props?: any) => ({
            ...props,
            type: "file",
            multiple: true,
            accept: Object.values(allowedFileTypes).flat().join(','),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) {
                    handleFileChange(Array.from(event.target.files));
                }
            },
            className: 'hidden'
        })
    }), [handleFileChange, dropzoneCallbacks]);


    const isProcessing = status === 'reading' || status === 'processing';

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6">
                {status !== 'success' && status !== 'processing' && (
                     <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold text-foreground">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">Supports: DOC, PDF, MP3, WAV, M4A</p>
                    </div>
                )}
               
                {files.length > 0 && status !== 'success' && status !== 'processing' && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Selected Files:</h3>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {file.type.startsWith('audio/') ? <FileAudio className="h-5 w-5 shrink-0" /> : <FileText className="h-5 w-5 shrink-0" />}
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {isProcessing && (
                    <div className="text-center p-8">
                        <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold">{status === 'reading' ? 'Reading files...' : 'Analyzing requirements...'}</p>
                        <p className="text-muted-foreground">This may take a moment. Please wait.</p>
                        {status === 'reading' && <Progress value={progress} className="w-full max-w-sm mx-auto mt-4" />}
                    </div>
                )}
                
                {status === 'idle' && files.length > 0 && <Button size="lg" className="w-full mt-6" onClick={handleSubmit} disabled={isProcessing}>
                    <Wand2 className="mr-2 h-5 w-5" /> Refine Requirements
                </Button>}

                {status === 'error' && (
                    <Alert variant="destructive" className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Processing Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        <Button variant="secondary" size="sm" className="mt-4" onClick={handleReset}>Try Again</Button>
                    </Alert>
                )}

                {status === 'success' && result && (
                    <div className="mt-6 space-y-6">
                         <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <h2 className="text-2xl font-bold text-green-800">Analysis Complete!</h2>
                        </div>
                        <div className="space-y-4">
                            <ClarificationSection clarifications={result.clarificationNeeded} />
                            <RequirementSection title="Functional Requirements" requirements={result.functionalRequirements || []} icon={Wand2} emptyText="No functional requirements were extracted." />
                            <RequirementSection title="Non-Functional Requirements" requirements={result.nonFunctionalRequirements || []} icon={Wand2} emptyText="No non-functional requirements were extracted." />
                        </div>
                        <Button size="lg" className="w-full mt-6" onClick={handleReset}>
                            <RefreshCw className="mr-2 h-5 w-5" /> Start Over
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
