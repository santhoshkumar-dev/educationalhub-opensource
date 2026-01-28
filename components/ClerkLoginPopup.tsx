"use client";

import React from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signin" | "signup";
  onModeSwitch?: (mode: "signin" | "signup") => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  mode = "signin",
  onModeSwitch,
}) => {
  // Helper to switch between modes
  const switchMode = () => {
    onModeSwitch?.(mode === "signin" ? "signup" : "signin");
  };

  // Helper to extract course slug from URL
  const getCourseSlug = () => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      return parts[2] || "";
    }
    return "";
  };

  const courseSlug = getCourseSlug();

  return (
    <Modal isOpen={isOpen} shouldBlockScroll={false} onOpenChange={onClose}>
      <ModalContent className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Content */}
        <ModalBody className="p-6">
          {mode === "signin" ? (
            <>
              <SignIn
                routing="hash"
                forceRedirectUrl={`/courses/${courseSlug}`}
                signUpUrl="#"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200",
                    socialButtonsBlockButtonText: "text-sm font-medium",
                    formButtonPrimary:
                      "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 w-full",
                    formFieldInput:
                      "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white",
                    footerActionLink:
                      "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium",
                  },
                }}
              />
              <div className="mt-4 border-t border-gray-200 pt-4 text-center dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New to EducationalHub?{" "}
                  <button
                    onClick={switchMode}
                    className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <SignUp
                routing="hash"
                forceRedirectUrl={`/courses/${courseSlug}`}
                signInUrl="#"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200",
                    socialButtonsBlockButtonText: "text-sm font-medium",
                    formButtonPrimary:
                      "bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 w-full",
                    formFieldInput:
                      "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white",
                    footerActionLink:
                      "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium",
                  },
                }}
              />
              <div className="mt-4 border-t border-gray-200 pt-4 text-center dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={switchMode}
                    className="font-medium text-purple-600 transition-colors duration-200 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
