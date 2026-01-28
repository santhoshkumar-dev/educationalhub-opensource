// @ts-nocheck
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "@bprogress/next/app";
import { useUser } from "@clerk/nextjs";

interface OnBoardingModelProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const OnBoardingModel: React.FC<OnBoardingModelProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 grid cursor-pointer place-items-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg cursor-default overflow-hidden bg-[#191919] p-6 text-white shadow-xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center"></div>
              <h3 className="mb-2 border-b pb-4 font-Monument text-4xl">
                Welcome !
              </h3>

              <p className="my-6">
                We’re delighted to have you here! Remember, every great journey
                begins with a single step, and you’ve already taken that first
                one. Whatever you choose to do, give it your all. Life is full
                of opportunities, and each moment is a chance to learn, grow,
                and make an impact. Stay curious, keep pushing forward, and
                believe in your ability to create something extraordinary. The
                path ahead is yours to shape—let’s make it a remarkable one!
                <br />
                <br />
                <span className="font-bold italic text-blue-500">
                  - Santhosh Kumar
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-blue-500 py-2 font-semibold text-white transition-colors hover:bg-customWhite/10"
                >
                  Proceed
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
