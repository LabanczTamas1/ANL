import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import background from "/public/Onboarding-background.svg";
import lightLogo from "/public/light-logo.png";
import { BackButton } from "./BackButton";
import { NextButton } from "./NextButton";
import { Progress } from "./Progress";

// ─── Data ───────────────────────────────────────────────────────────────────

const videos: string[] = [
  "https://youtu.be/EIdeD5W0WiU",
  "https://youtu.be/YuOauVKGD_0",
  "https://youtu.be/nroV2BgbvRE",
  "https://youtu.be/KgnB-Cai9Yk",
  "https://youtu.be/JuzkUdSzO18",
  "https://youtu.be/KygPo7Axfz4",
  "https://youtu.be/y3v3M-TElnc",
];

interface Step {
  label: string;
  shortLabel: string;
}

const steps: Step[] = [
  { label: "What To Expect From Onboarding", shortLabel: "Intro" },
  { label: "What To Expect From The 90 Days", shortLabel: "90 Days" },
  { label: "Sign Contract & Pay Invoice", shortLabel: "Contract" },
  { label: "Time For Ads Manager Integration!", shortLabel: "Ads" },
  { label: "Tell Us About Your Audience!", shortLabel: "Audience" },
  { label: "Book In Your Strategy Session", shortLabel: "Strategy" },
  { label: "Just Some Final Words", shortLabel: "Finish" },
];

interface TimedText {
  time: number;
  text: string;
}

const timedTexts: Record<number, TimedText[]> = {
  0: [
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Let's walk through your onboarding journey." },
    { time: 27, text: "Welcome!" },
  ],
  1: [{ time: 10, text: "Our company values integrity and innovation." }],
  2: [
    { time: 3, text: "Here's an overview of our product." },
    { time: 7, text: "Key features include ease of use and reliability." },
  ],
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function Onboarding(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const playerRef = useRef<ReactPlayer | null>(null);

  const handleProgress = (state: { played: number; playedSeconds: number }): void => {
    setCurrentTime(state.playedSeconds);
    setProgress(state.played * 100);
  };

  // Reset video state when changing steps
  useEffect(() => {
    setCurrentTime(0);
    setProgress(0);
    setDisplayText("");
  }, [currentStep]);

  // Update timed text based on video progress
  useEffect(() => {
    const stepTimedTexts = timedTexts[currentStep];
    if (!stepTimedTexts) {
      setDisplayText("");
      return;
    }

    const matched = stepTimedTexts.filter(
      (entry) => Math.floor(currentTime) >= entry.time
    );

    setDisplayText(matched.length > 0 ? matched[matched.length - 1].text : "");
  }, [currentTime, currentStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goBack = (): void => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goNext = (): void => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  return (
    <div
      className="relative flex flex-col min-h-screen bg-cover bg-center bg-surface-black text-content-inverse"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-surface-black/40 backdrop-blur-glass" />

      {/* Content (over overlay) */}
      <div className="relative z-raised flex flex-col flex-1 px-4 py-5 sm:px-6 md:px-10 lg:px-16">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <img
            src={lightLogo}
            alt="Logo"
            className="h-logo-sm w-auto sm:h-logo-sm transition-all duration-normal"
          />
          <span className="text-sm font-medium text-content-subtle-inverse tabular-nums">
            {currentStep + 1} / {steps.length}
          </span>
        </header>

        {/* ── Step indicator (segmented bar) ────────────────────────────── */}
        <nav aria-label="Onboarding steps" className="mb-6 sm:mb-8 max-w-3xl mx-auto w-full">
          <ol className="flex items-center gap-1 sm:gap-1.5">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <li key={idx} className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    aria-label={`Go to step ${idx + 1}: ${step.label}`}
                    aria-current={isActive ? "step" : undefined}
                    className={[
                      "w-full h-2 rounded-full transition-all duration-normal",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus focus-visible:ring-offset-1",
                      "hover:scale-y-150 origin-bottom",
                      isCompleted
                        ? "bg-brand"
                        : isActive
                          ? "bg-brand/70"
                          : "bg-content-muted/25 hover:bg-content-muted/40",
                    ].join(" ")}
                  />
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── Main content area ──────────────────────────────────────────── */}
        <main className="flex flex-col items-center flex-1">
          {/* Step title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 leading-tight max-w-2xl">
            {steps[currentStep].label}
          </h1>

          {/* Video player */}
          <div className="w-full max-w-3xl mx-auto mb-4 sm:mb-6">
            <div className="relative w-full rounded-xl overflow-hidden shadow-glass" style={{ paddingBottom: "56.25%" }}>
              <div className="absolute inset-0">
                <ReactPlayer
                  ref={playerRef}
                  url={videos[currentStep]}
                  controls
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                />
              </div>
            </div>
            {/* Video progress */}
            <div className="mt-3">
              <Progress value={progress} />
            </div>
          </div>

          {/* Timed text callout */}
          <div
            className={[
              "max-w-xl text-center transition-all duration-normal",
              displayText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
            ].join(" ")}
            aria-live="polite"
          >
            {displayText && (
              <p className="inline-block rounded-2xl bg-glass px-5 py-3 text-sm sm:text-base font-medium text-content-inverse shadow-card backdrop-blur-glass">
                {displayText}
              </p>
            )}
          </div>
        </main>

        {/* ── Navigation buttons ─────────────────────────────────────────── */}
        <footer className="mt-6 sm:mt-8">
          <div className="flex items-stretch justify-between gap-3 max-w-3xl mx-auto">
            <BackButton onClick={goBack} disabled={isFirstStep}>
              {steps[currentStep - 1]?.shortLabel ?? ""}
            </BackButton>

            <NextButton onClick={goNext} disabled={isLastStep}>
              {steps[currentStep + 1]?.shortLabel ?? ""}
            </NextButton>
          </div>
        </footer>
      </div>
    </div>
  );
}
