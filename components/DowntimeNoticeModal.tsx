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

const STORAGE_KEY = "eh_downtime_notice_ack_v1";

export function DowntimeNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasAcknowledged = window.localStorage.getItem(STORAGE_KEY) === "1";

    if (!hasAcknowledged) {
      setIsOpen(true);
    }

    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open && typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, "1");
        }
      }}
      placement="center"
      size="md"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Apologies for the downtime
            </ModalHeader>
            <ModalBody>
              <p>
                We’re very sorry for the recent downtime. The service is now
                fully operational. Thank you for your patience.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Got it
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
