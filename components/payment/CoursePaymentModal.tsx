import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Divider,
} from "@heroui/react";
import Image from "next/image";
import { ShoppingCart, CreditCard, PlayCircle } from "lucide-react";

interface CoursePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    course_name: string;
    course_image: string;
    total_videos: number;
    price: number;
    discountedPrice?: number;
    isPaid?: boolean;
    thumbnail?: string;
  };
  isProcessingPayment: boolean;
  handleInitiatePayment: () => void;
  handleAddToCart: () => void;
}

export default function CoursePaymentModal({
  isOpen,
  onClose,
  course,
  isProcessingPayment,
  handleInitiatePayment,
  handleAddToCart,
}: CoursePaymentModalProps) {
  if (!course) return null;

  // For free courses
  if (!course.isPaid) {
    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        backdrop="blur"
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-semibold">
              Enroll in Course
              <span className="mt-4 text-base text-gray-500 dark:text-gray-400">
                {course.course_name}
              </span>
            </ModalHeader>

            <ModalBody>
              {course.course_image && (
                <Image
                  src={course.course_image}
                  alt={course.course_name}
                  className="mb-3 rounded-lg object-cover sm:mb-0"
                  width={160}
                  height={112}
                />
              )}
              <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
                <div className="flex-1">
                  <p className="mb-3 text-gray-600 dark:text-gray-300">
                    Start learning with{" "}
                    <span className="font-medium">{course.total_videos}</span>{" "}
                    videos and resources — completely free!
                  </p>

                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        FREE COURSE
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-3" />

              <div className="flex w-full flex-col items-center justify-end gap-2 pb-3">
                <Button
                  className="w-full"
                  color="success"
                  size="lg"
                  startContent={<PlayCircle size={18} />}
                  onPress={onClose}
                >
                  Start Learning for Free
                </Button>
              </div>
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
    );
  }

  // For paid courses

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      backdrop="blur"
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-2xl font-semibold">
            Unlock Full Course
            <span className="mt-4 text-base text-gray-500 dark:text-gray-400">
              {course.course_name}
            </span>
          </ModalHeader>

          <ModalBody>
            {course.course_image && (
              <Image
                src={course.course_image}
                alt={course.course_name}
                className="mb-3 rounded-lg object-cover sm:mb-0"
                width={160}
                height={112}
              />
            )}
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
              <div className="flex-1">
                <p className="mb-3 text-gray-600 dark:text-gray-300">
                  Get lifetime access to all{" "}
                  <span className="font-medium">{course.total_videos}</span>{" "}
                  videos and resources.
                </p>

                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Original Price:
                    </span>
                    {course.discountedPrice ? (
                      <span className="text-gray-400 line-through">
                        ₹{course.price}
                      </span>
                    ) : (
                      <span className="text-lg font-bold">₹{course.price}</span>
                    )}
                  </div>

                  {course.discountedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Discounted Price:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{course.discountedPrice}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="flex w-full flex-col items-center justify-end gap-2 pb-3 sm:flex-row sm:justify-end">
              <Button
                className="w-full"
                color="secondary"
                variant="flat"
                startContent={<ShoppingCart size={18} />}
                onPress={handleAddToCart}
                disabled={isProcessingPayment}
              >
                Add to Cart
              </Button>
              <Button
                className="w-full"
                color="primary"
                startContent={<CreditCard size={18} />}
                onPress={handleInitiatePayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
