"use client";

import type { ComponentProps } from "react";
import React from "react";
import { useControlledState } from "@react-stately/utils";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { cn } from "@heroui/react";

export type ThemedStepProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export interface ThemedStepsProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  steps?: ThemedStepProps[];
  currentStep?: number;
  defaultStep?: number;
  hideProgressBars?: boolean;
  className?: string;
  stepClassName?: string;
  onStepChange?: (stepIndex: number) => void;
  clickable?: boolean;
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <m.path
        animate={{ pathLength: 1 }}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
      />
    </svg>
  );
}

const ThemedSteps = React.forwardRef<HTMLButtonElement, ThemedStepsProps>(
  (
    {
      steps = [],
      defaultStep = 0,
      onStepChange,
      currentStep: currentStepProp,
      hideProgressBars = false,
      stepClassName,
      className,
      clickable = false,
      ...props
    },
    ref,
  ) => {
    const [currentStep, setCurrentStep] = useControlledState(
      currentStepProp,
      defaultStep,
      onStepChange,
    );

    const handleStepClick = (stepIdx: number) => {
      if (clickable) {
        setCurrentStep(stepIdx);
      }
    };

    return (
      <nav aria-label="Progress" className="mx-auto w-full max-w-4xl">
        <ol
          className={cn(
            "relative flex w-full flex-row items-start justify-between overflow-auto will-change-scroll",
            className,
          )}
        >
          {steps?.map((step, stepIdx) => {
            let status =
              currentStep === stepIdx
                ? "active"
                : currentStep < stepIdx
                  ? "inactive"
                  : "complete";

            return (
              <li
                key={stepIdx}
                className="relative flex flex-1 flex-col items-center"
              >
                <div className="relative flex w-full justify-center">
                  <button
                    key={stepIdx}
                    ref={ref}
                    aria-current={status === "active" ? "step" : undefined}
                    className={cn(
                      "group relative z-10 flex flex-col items-center justify-center gap-y-2 rounded-lg p-4 transition-all duration-200",
                      clickable &&
                        "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                      !clickable && "cursor-default",
                      stepClassName,
                    )}
                    onClick={() => handleStepClick(stepIdx)}
                    disabled={!clickable}
                    {...props}
                  >
                    <div className="relative flex items-center">
                      <LazyMotion features={domAnimation}>
                        <m.div animate={status} className="relative">
                          <m.div
                            className={cn(
                              "relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-semibold transition-all duration-300",
                              {
                                "shadow-lg shadow-[#01ffca]/25":
                                  status === "complete",
                                "border-gray-300 text-gray-400":
                                  status === "inactive",
                                "border-[#01ffca] bg-[#01ffca]/10 text-[#01ffca]":
                                  status === "active",
                                "border-[#01ffca] bg-[#01ffca] text-black":
                                  status === "complete",
                              },
                            )}
                            initial={false}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center justify-center">
                              {status === "complete" ? (
                                <CheckIcon className="h-6 w-6 text-black" />
                              ) : (
                                <span>{stepIdx + 1}</span>
                              )}
                            </div>
                          </m.div>
                        </m.div>
                      </LazyMotion>
                    </div>

                    <div className="max-w-32 text-center">
                      <div
                        className={cn(
                          "text-sm font-medium transition-colors duration-300",
                          {
                            "text-gray-400": status === "inactive",
                            "font-semibold text-[#01ffca]":
                              status === "active" || status === "complete",
                          },
                        )}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div
                          className={cn(
                            "mt-1 text-xs transition-colors duration-300",
                            {
                              "text-gray-400": status === "inactive",
                              "text-gray-600 dark:text-gray-300":
                                status === "active" || status === "complete",
                            },
                          )}
                        >
                          {step.description}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Progress Bar */}
                  {stepIdx < steps.length - 1 && !hideProgressBars && (
                    <div
                      aria-hidden="true"
                      className="absolute left-[50%] top-10 z-0 flex h-0.5 w-full items-center"
                    >
                      <div className="w-6 flex-shrink-0" />
                      <div
                        className={cn(
                          "relative h-full flex-1 rounded-full bg-gray-200 transition-colors duration-300 dark:bg-gray-700",
                        )}
                      >
                        <LazyMotion features={domAnimation}>
                          <m.div
                            className="absolute left-0 top-0 h-full rounded-full bg-[#01ffca]"
                            initial={{
                              width: stepIdx < currentStep ? "100%" : "0%",
                            }}
                            animate={{
                              width: stepIdx < currentStep ? "100%" : "0%",
                            }}
                            transition={{
                              duration: 0.5,
                              ease: "easeInOut",
                              delay: stepIdx < currentStep ? 0.2 : 0,
                            }}
                          />
                        </LazyMotion>
                      </div>
                      <div className="w-6 flex-shrink-0" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

ThemedSteps.displayName = "ThemedSteps";

export default ThemedSteps;
