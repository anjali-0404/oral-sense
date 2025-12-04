"use client";

import { getVapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { AlertCircle, CrownIcon, Volume2 } from "lucide-react";

interface VapiWidgetProps {
  isPro?: boolean;
}

function VapiWidget({ isPro = false }: VapiWidgetProps) {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  const [vapiInitError, setVapiInitError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [callCount, setCallCount] = useState(0);
  const FREE_CALL_LIMIT = 1; // Free users can make 1 call per session

  const { user, isLoaded } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [audioTestDone, setAudioTestDone] = useState(false);

  // Function to test audio output
  const testAudio = () => {
    console.log("🔊 Testing audio output...");
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency to 800Hz, volume to 50%
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
    setAudioTestDone(true);
    setTimeout(() => setAudioTestDone(false), 2000);
    console.log("✅ Audio test complete - you should have heard a beep");
  };

  // auto-scroll for messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // setup event listeners for VAPI
  useEffect(() => {
    let vapi: any;
    try {
      vapi = getVapi();
      setVapiInitError(null);
      console.log("✅ VAPI initialized successfully");
    } catch (err: any) {
      console.error("❌ VAPI init error:", err);
      setVapiInitError(String(err?.message || err));
      setConnecting(false);
      return;
    }
    const handleCallStart = () => {
      console.log("📞 Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      console.log("📞 Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
      
      // Show upgrade prompt for free users after 1st call
      if (!isPro) {
        setCallCount(prev => prev + 1);
        if (callCount + 1 >= FREE_CALL_LIMIT) {
          setTimeout(() => setShowUpgradePrompt(true), 1000);
        }
      }
    };

    const handleSpeechStart = () => {
      console.log("🎤 AI started Speaking");
      setIsSpeaking(true);
      // Ensure volume is on
      if (typeof window !== "undefined" && window.navigator.mediaDevices) {
        console.log("🔊 Audio devices available");
      }
    };

    const handleSpeechEnd = () => {
      console.log("🤐 AI stopped Speaking");
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      console.log("💬 Message received:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        console.log("✨ Adding message to display:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.error("❌ VAPI Error Details:", {
        message: error?.message,
        code: error?.code,
        statusCode: error?.statusCode,
        error: error,
        type: typeof error,
        keys: error ? Object.keys(error) : []
      });
      
      // Provide user-friendly error message
      let errorMessage = "An error occurred during the voice call";
      
      if (error?.message?.includes("Invalid")) {
        errorMessage = "Invalid assistant ID or API key. Please check your environment variables.";
      } else if (error?.statusCode === 401 || error?.message?.includes("Unauthorized")) {
        errorMessage = "Authentication failed. Please verify your VAPI API key.";
      } else if (error?.statusCode === 429 || error?.message?.includes("rate")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.message?.includes("network")) {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else if (error?.message?.includes("microphone") || error?.message?.includes("permission")) {
        errorMessage = "Microphone permission denied. Please allow microphone access in browser settings.";
      }
      
      setVapiInitError(errorMessage);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      if (vapi) {
        vapi
          .off("call-start", handleCallStart)
          .off("call-end", handleCallEnd)
          .off("speech-start", handleSpeechStart)
          .off("speech-end", handleSpeechEnd)
          .off("message", handleMessage)
          .off("error", handleError);
      }
    };
  }, []);

  const toggleCall = async () => {
    // Check free limit before starting new call
    if (!isPro && callCount >= FREE_CALL_LIMIT && !callActive) {
      console.log("⚠️ Free trial limit reached");
      setShowUpgradePrompt(true);
      return;
    }
    
    if (callActive) {
      console.log("🛑 Stopping call");
      try {
        const vapi = getVapi();
        vapi.stop();
      } catch (err) {
        console.error("Error stopping call:", err);
      }
    } else {
        try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        console.log("🔄 Starting VAPI connection...");

        const vapi = getVapi();
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
        
        // Validate environment variables
        if (!assistantId) {
          throw new Error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID - check your .env file");
        }
        if (!apiKey) {
          throw new Error("Missing NEXT_PUBLIC_VAPI_API_KEY - check your .env file");
        }

        console.log("✅ Environment variables configured");
        console.log("🚀 Assistant ID:", assistantId);
        
        // Check for microphone permissions before starting
        if (typeof window !== "undefined" && window.navigator.mediaDevices) {
          try {
            console.log("🎤 Requesting microphone access...");
            const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("✅ Microphone permission granted");
            // Stop the stream since we just needed to check permissions
            stream.getTracks().forEach(track => track.stop());
          } catch (permErr: any) {
            console.warn("⚠️ Microphone permission issue:", {
              name: permErr?.name,
              message: permErr?.message,
              type: typeof permErr
            });
            
            if (permErr?.name === "NotAllowedError") {
              throw new Error("Microphone access denied. Please allow microphone access in browser settings.");
            } else if (permErr?.name === "NotFoundError") {
              throw new Error("No microphone found. Please connect a microphone device.");
            }
            // Continue for other permission issues
          }
        }

        console.log("🚀 Attempting to start call with assistant:", assistantId);
        
        // Add timeout to prevent indefinite hanging
        const callTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Call connection timeout after 15 seconds")), 15000)
        );
        
        const startCall = vapi.start(assistantId);
        
        try {
          await Promise.race([startCall, callTimeout]);
          console.log("✅ VAPI call started successfully");
        } catch (timeoutErr) {
          console.error("⏱️ Call timeout or error:", timeoutErr);
          throw timeoutErr;
        }
        } catch (error: any) {
          console.error("❌ Failed to start call:", {
            message: error?.message,
            stack: error?.stack,
            code: error?.code,
            statusCode: error?.statusCode,
            fullError: error
          });
          
          // Set detailed error message
          const errorMsg = error?.message || String(error) || "Unknown error occurred";
          setVapiInitError(errorMsg);
          setConnecting(false);
        }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col overflow-hidden pb-20">
      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-mono">
          <span>Talk to Your </span>
          <span className="text-primary uppercase">AI Dental Assistant</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Have a voice conversation with our AI assistant for dental advice and guidance
        </p>
      </div>

      {/* VIDEO CALL AREA */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI ASSISTANT CARD */}

        <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div
              className={`absolute inset-0 ${
                isSpeaking ? "opacity-30" : "opacity-0"
              } transition-opacity duration-300`}
            >
              {/* voice wave animation when speaking */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                      isSpeaking ? "animate-sound-wave" : ""
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI LOGO */}
            <div className="relative size-32 mb-4">
              <div
                className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
              />

              <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5"></div>
                <Image
                  src="/logo.png"
                  alt="AI Dental Assistant"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground">DentWise AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Dental Assistant</p>

            {/* SPEAKING INDICATOR */}
            <div
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                isSpeaking ? "border-primary" : ""
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />

              <span className="text-xs text-muted-foreground">
                {isSpeaking
                  ? "Speaking..."
                  : callActive
                  ? "Listening..."
                  : callEnded
                  ? "Call ended"
                  : "Waiting..."}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* User Image */}
            <div className="relative size-32 mb-4">
              <Image
                src={user?.imageUrl!}
                alt="User"
                width={128}
                height={128}
                className="size-full object-cover rounded-full"
              />
            </div>

            <h2 className="text-xl font-bold text-foreground">You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
            </p>

            {/* User Ready Text */}
            <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
              <div className={`w-2 h-2 rounded-full bg-muted`} />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MESSAGE CONTAINER */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
        >
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-muted-foreground mb-1">
                  {msg.role === "assistant" ? "DentWise AI" : "You"}:
                </div>
                <p className="text-foreground">{msg.content}</p>
              </div>
            ))}

            {callEnded && (
              <div className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-primary mb-1">System:</div>
                <p className="text-foreground">Call ended. Thank you for using DentWise AI!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPGRADE PROMPT FOR FREE USERS */}
      {showUpgradePrompt && !isPro && (
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Upgrade to Pro for Unlimited Calls</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You've used your free trial call! Upgrade to AI Pro or AI Basic to unlock unlimited voice consultations with our AI dental assistant.
                </p>
                <Link href="/pro">
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2">
                    <CrownIcon className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALL CONTROLS */}
      {vapiInitError && (
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <div className="rounded-md bg-destructive/10 border border-destructive/50 p-4 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-destructive mb-2">Voice Call Error</h4>
                <p className="text-destructive/90 mb-3">{vapiInitError}</p>
                <details className="text-xs text-destructive/80 space-y-1">
                  <summary className="cursor-pointer font-medium hover:text-destructive">
                    Troubleshooting Tips
                  </summary>
                  <ul className="list-disc list-inside pl-2 mt-2 space-y-1">
                    <li>Check browser console (F12) for detailed error messages</li>
                    <li>Verify NEXT_PUBLIC_VAPI_API_KEY is set in .env file</li>
                    <li>Verify NEXT_PUBLIC_VAPI_ASSISTANT_ID is set in .env file</li>
                    <li>Ensure microphone is connected and permissions are granted</li>
                    <li>Check your browser microphone settings (chrome://settings/content/microphone)</li>
                    <li>Try the "Test Audio" button to verify speakers work</li>
                    <li>Clear browser cache and reload (Ctrl+Shift+R)</li>
                    <li>Try a different browser if the issue persists</li>
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* FREE USER CALL LIMIT INFO */}
      {!isPro && (
        <div className="max-w-5xl mx-auto px-4 mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Free Trial:</span> {callCount}/{FREE_CALL_LIMIT} call used
          </p>
        </div>
      )}
      
      <div className="w-full flex justify-center gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={testAudio}
          className="gap-2"
        >
          <Volume2 className="w-4 h-4" />
          {audioTestDone ? "Audio Works! ✓" : "Test Audio"}
        </Button>
        
        <Button
          className={`w-44 text-xl rounded-3xl ${
            callActive
              ? "bg-destructive hover:bg-destructive/90"
              : callEnded && !isPro && callCount >= FREE_CALL_LIMIT
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : callEnded
              ? "bg-red-500 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          } text-white relative`}
          onClick={toggleCall}
          disabled={connecting || (callEnded && !isPro && callCount >= FREE_CALL_LIMIT)}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
          )}

          <span>
            {callActive
              ? "End Call"
              : connecting
              ? "Connecting..."
              : callEnded && !isPro && callCount >= FREE_CALL_LIMIT
              ? "Trial Limit Reached"
              : callEnded
              ? "Call Ended"
              : "Start Call"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default VapiWidget;
