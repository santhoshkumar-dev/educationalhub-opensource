// @ts-nocheck
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "@bprogress/next/app";
import { useUser } from "@clerk/nextjs";

interface SpringModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const SpringModal: React.FC<SpringModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const router = useRouter();
  const { user } = useUser();

  function deleteAccount() {
    fetch("/api/user", {
      method: "DELETE",
      body: JSON.stringify({ id: user.id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error in DELETE /api/user:", error);
      });

    location.reload();
  }

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
                Delete Account !
              </h3>

              <p className="my-6">
                This action will permanently delete your account and all
                associated data. You will not be able to recover any information
                after this process. Are you sure you want to delete your
                account?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-blue-500 py-2 font-semibold text-white transition-colors hover:bg-customWhite/10"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  className="w-full bg-red-500 py-2 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
