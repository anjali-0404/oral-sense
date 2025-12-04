"use client";
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

function Header() {
  const { isSignedIn } = useUser();
  const clerk = useClerk();

  const handleOpenSignIn = () => {
    try {
      if (!isSignedIn) clerk.openSignIn();
    } catch (e) {
      // swallow in dev; prevents "cannot_render_single_session_enabled" runtime notice
      // (we intentionally don't open the modal when a session already exists)
      // eslint-disable-next-line no-console
      console.debug("SignIn modal suppressed because a session exists.", e);
    }
  };

  const handleOpenSignUp = () => {
    try {
      if (!isSignedIn) clerk.openSignUp();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug("SignUp modal suppressed because a session exists.", e);
    }
  };
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Oral-sense Logo" width={32} height={32} className="w-11" />
          <span className="font-semibold text-lg">Oral-Sense</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            How it Works
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Pricing
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant={"ghost"} size={"sm"} onClick={handleOpenSignIn}>
              Login
            </Button>
            <Button size={"sm"} onClick={handleOpenSignUp}>
              Sign Up
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
export default Header;
