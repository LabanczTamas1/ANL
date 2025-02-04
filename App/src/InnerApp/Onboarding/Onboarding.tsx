import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { Progress } from "./Progress";
import background from "/public/Onboarding-background.svg";
import lightLogo from "/public/light-logo.png";
import { BackButton } from "./BackButton";
import { NextButton } from "./NextButton";
import { Button } from "@mui/material";
import Tooltip from "./Tooltip";
import { ClassNames } from "@emotion/react";

const videos: string[] = [
  "https://www.youtube.com/watch?v=00_tIrUeLkA",
  "https://youtu.be/1iflO5k6frY?si=Z7TnRU07IqT8Ki2J",
  "https://www.w3schools.com/html/movie.mp4",
  "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
];

const steps: string[] = [
  "What To Expect From Onboarding",
  "What To Expect From The 90 Days",
  "Sign Contract & Pay Invoice",
  "Time For Ads Manager Integration!",
  "Tell Us About Your Audience!",
  "Book In Your Strategy Session",
  "Just Some Final Words",
];

interface TimedText {
  time: number;
  text: string;
}

const timedTexts: Record<number, TimedText[]> = {
  0: [
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
    { time: 5, text: "Welcome to the introduction!" },
    { time: 7, text: "Welcome to the wefvsdvsdvintroduction!" },
    { time: 27, text: "Welcome!" },
  ],
  1: [{ time: 10, text: "Our company values integrity and innovation." }],
  2: [
    { time: 3, text: "Here's an overview of our product." },
    { time: 7, text: "Key features include ease of use and reliability." },
  ],
};

const count = Object.values(timedTexts).flat().length;

const allTexts = Object.values(timedTexts)
  .flat()
  .map((item) => item.text);

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const playerRef = useRef<ReactPlayer | null>(null);

  // To accumulate total text count across all previous steps
  const getTotalTextCount = (step: number) => {
    return Object.values(timedTexts).slice(0, step).flat().length;
  };

  // Define the handleProgress function here
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played * 100);
    setCurrentTime(state.playedSeconds);
  };

  const setVideoTimeToFiveSeconds = (time: number) => {
    if (playerRef.current) {
      // Seek to the specified time
      playerRef.current.seekTo(time, "seconds");
      // Set the video to play immediately after seeking
      playerRef.current.seekTo(time, "seconds", true); // The third argument is 'play' flag

      // Ensure the video is playing after seeking
      if (playerRef.current.getInternalPlayer()) {
        const internalPlayer = playerRef.current.getInternalPlayer();
        if (internalPlayer.paused) {
          internalPlayer.play();
        }
      }
    }
  };

  useEffect(() => {
    if (timedTexts[currentStep]) {
      const stepTimedTexts = timedTexts[currentStep];
      const matchingTexts = stepTimedTexts.filter(
        (entry) => Math.floor(currentTime) >= entry.time
      );

      // Get the total count of texts in previous steps
      const totalPreviousTextCount = getTotalTextCount(currentStep);

      if (matchingTexts.length > 0) {
        setDisplayText(matchingTexts[matchingTexts.length - 1].text);
        setCurrentTextIndex(totalPreviousTextCount + matchingTexts.length);
      } else {
        setDisplayText("");
        setCurrentTextIndex(totalPreviousTextCount); // Reset to the count of previous texts
      }
    } else {
      setDisplayText("");
      setCurrentTextIndex(getTotalTextCount(currentStep)); // Reset if no texts exist for the current step
    }
  }, [currentTime, currentStep]);

  return (
<div
  className="relative flex flex-col items-center justify-center p-6 mx-auto bg-cover bg-center bg-black min-h-screen text-white overflow-hidden"
  style={{ backgroundImage: `url(${background})` }}
>
  <div className="absolute inset-0 w-full h-full bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between mx-8 mt-8">
          <img
            src={lightLogo}
            alt="Logo"
            className={`transition-all duration-300 md:w-[120px] w-[60px]`}
          />

          <div className="flex mt-5 w-full overflow-x-auto max-w-[50vw]">
            {/* {Array.from({ length: currentTextIndex }).map((_, index) => {
              const width = `${Math.floor((1 / count) * 100)}%`;
              return (
              <div className="relative group inline-block">
                <Button
                  onClick={() =>
                    setVideoTimeToFiveSeconds(
                      Object.values(timedTexts).flat()[index].time
                    )
                  }
                  variant="contained"
                  color="primary"
                  style={{
                    width: width,
                    height: "8px",
                    padding: "0",
                  }}
                  key={index}
                >
                  <div
                    key={index}
                    className="absolute h-full"
                    style={{
                      width: width,
                    }}
                  />{" "}
                </Button>
                <Tooltip text={allTexts[index]} />
                </div>
              );
            })}
            {Array.from({ length: count - currentTextIndex }).map(
              (_, index) => {
                const width = `${Math.floor((1 / count) * 100)}%`;
                return (
                  <div
                    key={index}
                    className={`h-2 bg-gray-300 mx-[0.2px] rounded-lg`}
                    style={{
                      width: width,
                    }}
                  />
                );
              }
            )} */}
          </div>

          <div className="mt-4 w-[100px] text-md text-gray-600 text-white">
            Step {currentStep + 1}/{steps.length}
          </div>
        </div>
        <article className="md:mx-50 mx-4">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Step {currentStep + 1} - {steps[currentStep]}
          </h1>
            <div className="w-full flex justify-center">
          <div className="lg:w-[58%] md:w-[80%] w-[100%] h-[56.25vw] max-h-[50vh] md:max-h-[50vh] lg:max-h-[65vh]">
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
          {/* <Progress value={progress} className="w-full mb-4" />
          <div>{count}</div>
          <div>{currentTextIndex}</div>
          <div>
            {timedTexts[2]?.map((entry, index) => (
              <div key={index}>
                <p>{entry.text}</p>
              </div>
            ))}
          </div> */}

          {/* {Array.from({ length: currentTextIndex }).map((_, index) => (
            <div key={index}>{`${Math.floor((index / count) * 100)} szia`}</div>
          ))} */}

          {displayText && (
            <div className="text-center text-lg font-semibold mt-4 text-white">
              {displayText}
            </div>
          )}

          <div className="flex justify-between w-full gap-2 mt-4">
            <BackButton
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              icon={true}
            >
               {steps[currentStep - 1]}
            </BackButton>

            <NextButton
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
              }
              disabled={currentStep === steps.length - 1}
              icon={true}
            >
              {steps[currentStep + 1]}
            </NextButton>
          </div>
        </article>
      </div>
    </div>
  );
}
