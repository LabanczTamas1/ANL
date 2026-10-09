import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, Heading, Text, ProgressBar, cn } from "@design-system/components";
import { useLanguage } from "../../hooks/useLanguage";

const background = "/Onboarding-background.svg";
const lightLogo = "/light-logo.png";

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
  /** Translation key for the full step title. */
  labelKey: string;
  /** Translation key for the short label used in nav buttons. */
  shortKey: string;
}

const steps: Step[] = [
  { labelKey: "onboarding.step1.label", shortKey: "onboarding.step1.short" },
  { labelKey: "onboarding.step2.label", shortKey: "onboarding.step2.short" },
  { labelKey: "onboarding.step3.label", shortKey: "onboarding.step3.short" },
  { labelKey: "onboarding.step4.label", shortKey: "onboarding.step4.short" },
  { labelKey: "onboarding.step5.label", shortKey: "onboarding.step5.short" },
  { labelKey: "onboarding.step6.label", shortKey: "onboarding.step6.short" },
  { labelKey: "onboarding.step7.label", shortKey: "onboarding.step7.short" },
];

interface TimedText {
  time: number;
  /** Translation key for the callout text shown at this timestamp. */
  textKey: string;
}

const timedTexts: Record<number, TimedText[]> = {
  0: [
    { time: 5, textKey: "onboarding.timed.0.1" },
    { time: 7, textKey: "onboarding.timed.0.2" },
    { time: 27, textKey: "onboarding.timed.0.3" },
  ],
  1: [{ time: 10, textKey: "onboarding.timed.1.1" }],
  2: [
    { time: 3, textKey: "onboarding.timed.2.1" },
    { time: 7, textKey: "onboarding.timed.2.2" },
  ],
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function Onboarding(): React.JSX.Element {
  const { t } = useLanguage();
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

    setDisplayText(matched.length > 0 ? t(matched[matched.length - 1].textKey) : "");
  }, [currentTime, currentStep, t]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goBack = (): void => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goNext = (): void => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  // `dark` scopes the design-system dark tokens to this always-dark glass
  // surface, independent of the user's global light/dark preference.
  return (
    <div
      className="dark relative flex flex-col min-h-screen bg-cover bg-center bg-surface-black text-content-inverse"
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
            alt={t("onboarding.logoAlt")}
            className="h-logo-sm w-auto sm:h-logo-sm transition-all duration-normal"
          />
          <Text size="sm" tone="subtle" className="font-medium tabular-nums">
            {t("onboarding.stepCounter", {
              current: String(currentStep + 1),
              total: String(steps.length),
            })}
          </Text>
        </header>

        {/* ── Step indicator (segmented bar) ────────────────────────────── */}
        <nav aria-label={t("onboarding.stepsNav")} className="mb-6 sm:mb-8 max-w-3xl mx-auto w-full">
          <ol className="flex items-center gap-1 sm:gap-1.5">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <li key={idx} className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    aria-label={t("onboarding.goToStep", {
                      number: String(idx + 1),
                      label: t(step.labelKey),
                    })}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "w-full h-2 rounded-full transition-all duration-normal",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus focus-visible:ring-offset-1",
                      "hover:scale-y-150 origin-bottom",
                      isCompleted
                        ? "bg-brand"
                        : isActive
                          ? "bg-brand/70"
                          : "bg-content-muted/25 hover:bg-content-muted/40",
                    )}
                  />
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── Main content area ──────────────────────────────────────────── */}
        <main className="flex flex-col items-center flex-1">
          {/* Step title */}
          <Heading
            level={2}
            as="h1"
            className="text-center font-bold md:text-3xl lg:text-4xl mb-4 sm:mb-6 leading-tight max-w-2xl"
          >
            {t(steps[currentStep].labelKey)}
          </Heading>

          {/* Video player */}
          <Card
            padding="sm"
            className="w-full max-w-3xl mx-auto mb-4 sm:mb-6 !bg-glass !border-white/10 backdrop-blur-glass shadow-glass"
          >
            <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
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
              <ProgressBar value={progress} tone="brand" trackClassName="h-1.5" />
            </div>
          </Card>

          {/* Timed text callout */}
          <div
            className={cn(
              "max-w-xl text-center transition-all duration-normal",
              displayText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
            )}
            aria-live="polite"
          >
            {displayText && (
              <Card
                as="p"
                padding="none"
                className="inline-block !bg-glass !border-white/10 backdrop-blur-glass shadow-card px-5 py-3"
              >
                <Text as="span" size="sm" className="font-medium sm:text-base">
                  {displayText}
                </Text>
              </Card>
            )}
          </div>
        </main>

        {/* ── Navigation buttons ─────────────────────────────────────────── */}
        <footer className="mt-6 sm:mt-8">
          <div className="flex items-stretch justify-between gap-3 max-w-3xl mx-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={goBack}
              aria-label={t("onboarding.backTo", {
                label: currentStep > 0 ? t(steps[currentStep - 1].labelKey) : t("onboarding.previousStep"),
              })}
              leftIcon={<ChevronLeft className="h-5 w-5 shrink-0" aria-hidden="true" />}
              className={cn(
                "max-w-[45%] backdrop-blur-glass shadow-card active:scale-[0.97]",
                "!bg-glass !border-white/10 !text-content-inverse hover:!bg-brand/30",
                isFirstStep && "invisible pointer-events-none",
              )}
            >
              <span className="flex flex-col items-start leading-tight overflow-hidden">
                <span className="text-xs text-content-muted">{t("onboarding.back")}</span>
                <span className="truncate">
                  {currentStep > 0 ? t(steps[currentStep - 1].shortKey) : ""}
                </span>
              </span>
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={goNext}
              aria-label={t("onboarding.nextTo", {
                label:
                  currentStep < steps.length - 1
                    ? t(steps[currentStep + 1].labelKey)
                    : t("onboarding.nextStep"),
              })}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />}
              className={cn(
                "max-w-[45%] shadow-card active:scale-[0.97]",
                isLastStep && "invisible pointer-events-none",
              )}
            >
              <span className="flex flex-col items-end leading-tight overflow-hidden">
                <span className="text-xs text-content-inverse/70">{t("onboarding.next")}</span>
                <span className="truncate">
                  {currentStep < steps.length - 1 ? t(steps[currentStep + 1].shortKey) : ""}
                </span>
              </span>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
