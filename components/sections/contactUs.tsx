/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "@/components/static/textEditor";

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    toast.promise(
      fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then(async (res) => {
        if (res.status === 200) {
          setFormData({ name: "", email: "", message: "" });
          setStatus("Message sent!");
          return "Message sent!";
        } else {
          setStatus("Failed to send message.");
          throw new Error("Failed to send message.");
        }
      }),
      {
        pending: "Sending...",
        success: "Message sent!",
        error: "Failed to send message.",
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-center text-4xl font-bold">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Have a question, feedback, or need support? We&#39;d love to hear
            from you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-8">
          {/* --- Contact Information --- */}
          <div className="space-y-8">
            <div>
              <h3 className="font-Monument text-2xl dark:text-white">
                Contact Us
              </h3>
              <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                For general inquiries, partnerships, or support, please email us
                directly.
              </p>
              <a
                href="mailto:contact@educationalhub.in"
                className="mt-3 inline-block text-xl font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                contact@educationalhub.in
              </a>
            </div>
            <div>
              <h3 className="font-Monument text-2xl dark:text-white">
                DMCA / Copyright
              </h3>
              <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                To report a copyright infringement, please contact our DMCA
                agent.
              </p>
              <a
                href="mailto:dmca@educationalhub.in"
                className="mt-3 inline-block text-xl font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                dmca@educationalhub.in
              </a>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            title="Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-black bg-transparent p-2 text-black dark:border-gray-300 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            title="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="mt-1 block w-full border border-black bg-transparent p-2 text-black dark:border-gray-300 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <TextEditor
            setText={(value: string) =>
              setFormData({ ...formData, message: value })
            }
            text={formData.message}
            placeholder="Enter your message here..."
          />
        </div>
        <button type="submit" className="bg-blue-500 px-4 py-2 text-white">
          Send
        </button>
      </form>

      {status && <p className="mt-4">{status}</p>}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
