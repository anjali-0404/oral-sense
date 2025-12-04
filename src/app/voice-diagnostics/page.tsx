"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, AlertCircleIcon, XCircleIcon, RefreshCwIcon } from "lucide-react";

interface DiagnosticResult {
  name: string;
  status: "success" | "warning" | "error" | "pending";
  message: string;
  details?: string;
}

export default function VoiceDiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { name: "API Key", status: "pending", message: "Checking..." },
    { name: "Assistant ID", status: "pending", message: "Checking..." },
    { name: "Microphone", status: "pending", message: "Checking..." },
    { name: "Audio Context", status: "pending", message: "Checking..." },
    { name: "VAPI Library", status: "pending", message: "Checking..." },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Check 1: API Key
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (apiKey) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(apiKey)) {
        newResults.push({
          name: "API Key",
          status: "success",
          message: "Valid UUID format",
          details: `Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-8)}`,
        });
      } else {
        newResults.push({
          name: "API Key",
          status: "warning",
          message: "Not a valid UUID format",
          details: `Key: ${apiKey}`,
        });
      }
    } else {
      newResults.push({
        name: "API Key",
        status: "error",
        message: "NEXT_PUBLIC_VAPI_API_KEY not found",
        details: "Set this in your .env file",
      });
    }

    // Check 2: Assistant ID
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (assistantId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(assistantId)) {
        newResults.push({
          name: "Assistant ID",
          status: "success",
          message: "Valid UUID format",
          details: `ID: ${assistantId.slice(0, 8)}...${assistantId.slice(-8)}`,
        });
      } else {
        newResults.push({
          name: "Assistant ID",
          status: "warning",
          message: "Not a valid UUID format",
          details: `ID: ${assistantId}`,
        });
      }
    } else {
      newResults.push({
        name: "Assistant ID",
        status: "error",
        message: "NEXT_PUBLIC_VAPI_ASSISTANT_ID not found",
        details: "Set this in your .env file",
      });
    }

    // Check 3: Microphone
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const tracks = stream.getTracks();
        const audioTrack = tracks[0];

        newResults.push({
          name: "Microphone",
          status: "success",
          message: "Microphone accessible",
          details: `Device: ${audioTrack.label || "Unknown"}`,
        });

        tracks.forEach((track) => track.stop());
      } else {
        newResults.push({
          name: "Microphone",
          status: "error",
          message: "getUserMedia not supported",
          details: "Your browser may not support audio input",
        });
      }
    } catch (err: any) {
      newResults.push({
        name: "Microphone",
        status: "error",
        message: `Error: ${err?.name || "Unknown"}`,
        details: err?.message || "Permission denied or device not found",
      });
    }

    // Check 4: Audio Context
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        newResults.push({
          name: "Audio Context",
          status: "success",
          message: "Web Audio API supported",
          details: `Sample Rate: ${ctx.sampleRate}Hz`,
        });
        ctx.close();
      } else {
        newResults.push({
          name: "Audio Context",
          status: "error",
          message: "Web Audio API not supported",
          details: "Your browser may not support audio output",
        });
      }
    } catch (err: any) {
      newResults.push({
        name: "Audio Context",
        status: "error",
        message: `Error: ${err?.message}`,
        details: "Could not initialize audio context",
      });
    }

    // Check 5: VAPI Library
    try {
      const Vapi = await import("@vapi-ai/web").then((m) => m.default);
      if (Vapi) {
        newResults.push({
          name: "VAPI Library",
          status: "success",
          message: "VAPI library loaded",
          details: "Ready to use",
        });
      } else {
        newResults.push({
          name: "VAPI Library",
          status: "error",
          message: "VAPI library not found",
          details: "Check npm installation",
        });
      }
    } catch (err: any) {
      newResults.push({
        name: "VAPI Library",
        status: "error",
        message: `Error loading VAPI: ${err?.message}`,
        details: "Check console for more details",
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircleIcon className="w-5 h-5 text-amber-600" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <RefreshCwIcon className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30";
      case "warning":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30";
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30";
    }
  };

  const allPassed = results.every((r) => r.status === "success");
  const hasErrors = results.some((r) => r.status === "error");

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Call Diagnostics</h1>
          <p className="text-muted-foreground">
            Check if your system is properly configured for VAPI voice calls
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          {results.map((result, index) => (
            <Card key={index} className={`border-2 ${getStatusColor(result.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(result.status)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{result.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-2 bg-black/5 dark:bg-white/5 p-2 rounded font-mono">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {allPassed ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-950/20 dark:border-green-900/30">
              <h3 className="font-semibold text-green-700 mb-2">✅ All checks passed!</h3>
              <p className="text-sm text-green-600">
                Your system is properly configured for VAPI voice calls. Go to the{" "}
                <a href="/voice" className="underline font-semibold hover:text-green-800">
                  voice page
                </a>{" "}
                and try making a call.
              </p>
            </div>
          ) : hasErrors ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-950/20 dark:border-red-900/30">
              <h3 className="font-semibold text-red-700 mb-2">❌ Issues Found</h3>
              <p className="text-sm text-red-600 mb-4">
                Please fix the errors above before attempting voice calls.
              </p>
              <div className="text-xs text-red-600 space-y-2">
                <p>
                  <strong>Common fixes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure .env file has NEXT_PUBLIC_VAPI_API_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID</li>
                  <li>Restart the dev server after updating .env (npm run dev)</li>
                  <li>Check browser microphone permissions (Settings → Privacy → Microphone)</li>
                  <li>Allow microphone access when prompted by the browser</li>
                  <li>Try in a different browser or incognito window</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-900/30">
              <h3 className="font-semibold text-amber-700 mb-2">⚠️ Warnings Found</h3>
              <p className="text-sm text-amber-600">
                Voice calls may work but there could be compatibility issues.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <Button onClick={runDiagnostics} disabled={isRunning} className="gap-2">
            <RefreshCwIcon className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running diagnostics..." : "Re-run diagnostics"}
          </Button>
          <a href="/voice">
            <Button variant="outline">Go to Voice Page</Button>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Guide</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Microphone Issues</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>✓ Check if microphone is connected</p>
                <p>✓ Go to browser settings and enable microphone</p>
                <p>✓ Remove this site from blocked list</p>
                <p>✓ Test microphone in another app</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">API/Key Issues</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>✓ Get API key from https://console.vapi.ai</p>
                <p>✓ Create assistant in VAPI dashboard</p>
                <p>✓ Update .env file with correct keys</p>
                <p>✓ Restart dev server (npm run dev)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Browser Compatibility</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>✓ Use Chrome, Edge, or Firefox</p>
                <p>✓ Update browser to latest version</p>
                <p>✓ Try incognito/private mode</p>
                <p>✓ Clear browser cache</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Still Having Issues?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>✓ Open browser console (F12)</p>
                <p>✓ Check error messages in console</p>
                <p>✓ Check .env file is properly loaded</p>
                <p>✓ Visit VAPI docs: https://docs.vapi.ai</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
