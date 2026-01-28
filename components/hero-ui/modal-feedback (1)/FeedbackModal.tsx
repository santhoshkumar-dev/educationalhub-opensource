"use client";

import React, { useState } from "react";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { Flag } from "lucide-react";

// Define the shape of the data that will be submitted
interface ReportData {
  reportType: string;
  description: string;
}

// Define the props for the component
interface FeedbackModalProps {
  onSubmit: (data: ReportData) => void;
}

// The component now accepts an `onSubmit` function as a prop
export default function FeedbackModal({ onSubmit }: FeedbackModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // State to manage the form inputs with type annotations
  const [reportType, setReportType] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const reportTypes: string[] = [
    "Broken Files",
    "Video Playback Issue",
    "Audio Issue",
    "Missing Files",
    "Inaccurate Information",
    "Misleading Title/Description",
    "Copyright Claim (DMCA)",
    "Spam or Advertisement",
    "Offensive Content",
    "Accessibility Issue",
    "Other",
  ];

  // Add types for the event and onClose function
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    onClose: () => void,
  ) => {
    e.preventDefault();
    if (!reportType || !description) return; // Basic validation

    // Call the passed-in onSubmit function with the state
    onSubmit({ reportType, description });

    // Clear the form and close the modal
    setReportType("");
    setDescription("");
    onClose();
  };

  return (
    <section>
      <button
        title="Report"
        type="button"
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:hover:bg-gray-700"
        onClick={onOpen}
      >
        <Flag />
      </button>
      <Modal
        isOpen={isOpen}
        shouldBlockScroll={false}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <ModalHeader className="flex-col items-center gap-1 px-0 text-center">
                <h1 className="text-xl">Report an Issue</h1>
                <p className="font-normal text-default-500 text-small">
                  Let us know what&apos;s wrong. Please provide as much detail
                  as possible so we can resolve it quickly.
                </p>
              </ModalHeader>
              <form
                className="flex w-full flex-col gap-4"
                onSubmit={(e) => handleSubmit(e, onClose)}
              >
                <Select
                  label="Type of issue"
                  placeholder="Select an issue type"
                  selectedKeys={[reportType]}
                  // Type the event for the Select component's onChange
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setReportType(e.target.value)
                  }
                  isRequired
                >
                  {reportTypes.map((type) => (
                    <SelectItem key={type} textValue={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  aria-label="Feedback"
                  minRows={8}
                  name="feedback"
                  placeholder="e.g., The video in Chapter 2 stops playing at 1:23."
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  isRequired
                  style={{
                    outline: "none",
                  }}
                />

                <Divider className="my-2" />
                <div className="flex w-full items-center justify-end pb-4">
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      type="button"
                      variant="flat"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </div>
                </div>
              </form>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
