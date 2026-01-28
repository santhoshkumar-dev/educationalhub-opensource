"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "eh_donation_modal_ack_v1";

export function DonationModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasAcknowledged = window.localStorage.getItem(STORAGE_KEY) === "1";

    if (!hasAcknowledged) {
      // Show modal after 3 seconds delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }

    setIsLoaded(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const handleDonate = () => {
    // You can replace this with your actual donation link
    router.push("/donate");
    handleClose();
  };

  if (!isLoaded && !isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      placement="center"
      size="lg"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:heart-bold"
                  className="h-6 w-6 text-red-500"
                />
                <span>Support Free Education for Everyone</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-base">
                  Educational Hub is committed to providing{" "}
                  <strong>free, quality education</strong> to learners around
                  the world. Your generous donation helps us:
                </p>

                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <span>
                      Keep the platform <strong>completely free</strong> for all
                      students worldwide
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <span>
                      Cover <strong>server costs</strong> and infrastructure
                      maintenance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <span>
                      Purchase{" "}
                      <strong>Udemy and other platform subscriptions</strong> to
                      bring more quality content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <span>
                      Expand our course library and improve platform features
                    </span>
                  </li>
                </ul>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every contribution, no matter how small, makes a difference in
                  someone&apos;s educational journey. Thank you for your
                  support! 💙
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex-col gap-2 sm:flex-row">
              <Button
                color="default"
                variant="light"
                onPress={handleClose}
                className="w-full sm:w-auto"
              >
                Maybe Later
              </Button>
              <Button
                color="primary"
                onPress={handleDonate}
                className="w-full sm:w-auto"
                startContent={
                  <Icon icon="solar:heart-bold" className="h-5 w-5" />
                }
              >
                Support Us
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
