/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Link from "next/link"; // Use Next.js Link for internal navigation

export default function PrivacyPolicyPage() {
  return (
    <section className="my-12 px-4 xl:px-12">
      <h1 className="mb-8 text-center text-4xl font-bold">Privacy Policy</h1>

      <div className="prose prose-lg mx-auto max-w-4xl space-y-4">
        <p>
          Welcome to EducationalHub ("we," "us," or "our"). We respect your
          privacy and are committed to protecting your personal information.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit our website
          educationalhub.in (the "Website").
        </p>

        <h2 className="font-Monument text-2xl">1. Information We Collect</h2>
        <p>We may collect personal information from you in several ways:</p>
        <ul>
          <li>
            <strong>Information You Provide to Us:</strong> This includes
            information you provide when you register for an account, enroll in
            a course, or contact us. This may include your name and email
            address.
          </li>
          <li>
            <strong>Course and Usage Data:</strong> We may collect information
            about your progress in courses, quizzes, and any content you post,
            such as reviews or forum messages.
          </li>
          <li>
            <strong>Information from Third Parties:</strong> We use third-party
            services for authentication and payments.
            <ul>
              <li>
                <strong>Authentication:</strong> For details on how Clerk
                handles your login credentials and personal data, please refer
                to Clerk’s{" "}
                <a
                  href="https://clerk.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-500"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Payments:</strong> Payment information is handled by
                PayU. Please refer to PayU’s{" "}
                <a
                  href="https://payu.in/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-500"
                >
                  Privacy Policy
                </a>{" "}
                for details on how your payment information is managed. We do
                not store your full credit card or payment details.
              </li>
            </ul>
          </li>
        </ul>

        <h2 className="font-Monument text-2xl">
          2. How We Use Your Information
        </h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain our Website.</li>
          <li>Manage your account and your course enrollments.</li>
          <li>Track your learning progress.</li>
          <li>Process your payments and transactions.</li>
          <li>
            Communicate with you, including responding to your inquiries and
            sending service-related emails.
          </li>

          <li>Improve our Website, content, and services.</li>
          <li>Monitor and analyze usage and trends.</li>
        </ul>

        <h2 className="font-Monument text-2xl">
          3. How We Share Your Information
        </h2>
        <p>
          We do not sell or rent your personal information. We may share your
          information in the following situations:
        </p>
        <ul>
          <li>
            <strong>With Service Providers:</strong> With third-party vendors
            who perform services for us, such as payment processing (PayU) and
            authentication (Clerk).
          </li>
          <li>
            <strong>With Instructors/Organizations:</strong> We may share your
            course progress and registration information with the third-party
            colleges, universities, tutors, or organizations who provide the
            courses you enroll in.
          </li>
          <li>
            <strong>For Legal Reasons:</strong> We may disclose your information
            if required by law or in response to a valid legal process.
          </li>
        </ul>

        <h2 className="font-Monument text-2xl">4. Your Data Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your
          personal data, such as the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your personal data.</li>
        </ul>
        <p>
          To exercise these rights, please contact us at{" "}
          <a
            href="mailto:privacy@educationalhub.in"
            className="font-bold text-blue-500"
          >
            privacy@educationalhub.in
          </a>
          .
        </p>

        <h2 className="font-Monument text-2xl">
          5. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last Updated" date.
        </p>

        <h2 className="font-Monument text-2xl">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>
          <a
            href="mailto:contact@educationalhub.in"
            className="font-bold text-blue-500"
          >
            contact@educationalhub.in
          </a>
        </p>
      </div>
    </section>
  );
}
