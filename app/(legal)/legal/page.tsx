import React from "react";

export default function page() {
  return (
    <section className="my-12">
      <h1 className="text-center text-4xl">Legal</h1>

      <ol className="px-4 xl:px-12">
        <li className="mb-4 font-Monument text-2xl">1. Privacy Policy</li>

        <li className="mb-8 text-xl">
          Educational Web respects your privacy and is committed to protecting
          your personal information. For details on how Clerk handles your login
          credentials and personal data, please refer to Clerk’s{" "}
          <a
            href="https://clerk.com/legal/privacy"
            className="font-bold text-blue-500"
          >
            Privacy Policy
          </a>
          . Payment information is handled by PayU. Please refer to PayU’s{" "}
          <a
            href="https://payu.in/privacy-policy/"
            className="font-bold text-blue-500"
          >
            Privacy Policy
          </a>{" "}
          for details on how your payment information is managed.
        </li>

        <li className="mb-4 font-Monument text-2xl">2. Disclaimer</li>

        <li className="mb-8 text-xl">
          The content provided on the Website is for educational purposes only.
          While we strive to offer high-quality content, we do not guarantee the
          accuracy, completeness, or reliability of any information provided. We
          disclaim all liability for any errors or omissions in the content or
          any reliance you place on the content. Additionally, we are not
          responsible for the courses hosted by third-party parties such as
          colleges, universities, tutors, or organizations through the app.
        </li>

        <li className="mb-4 font-Monument text-2xl">
          3. Intellectual Property Rights
        </li>

        <li className="mb-8 text-xl">
          All content available on the Website, including but not limited to
          course materials, videos, text, images, and logos, may be the property
          of third parties such as course providers, universities, tutors, or
          other organizations. This content is protected by intellectual
          property laws, and you are not permitted to copy, distribute, modify,
          or create derivative works from any content on the Website without the
          express written consent of the content owner.
        </li>

        <li className="mb-4 font-Monument text-2xl">
          4. Copyright Infringement
        </li>

        <li className="mb-8 text-xl">
          If you believe that any content on the Website infringes your
          copyright, please contact us at{" "}
          <a
            href="mailto:dmca@educationalhub.in"
            className="font-bold text-blue-500"
          >
            dmca@educationalhub.in
          </a>
          . We will take appropriate action in response to valid claims.
        </li>
      </ol>
    </section>
  );
}
