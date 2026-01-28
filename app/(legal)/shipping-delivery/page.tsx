import React from "react";
import Link from "next/link"; // Optional, if you link to your contact page

export default function ShippingPolicyPage() {
  return (
    <section className="my-12 px-4 xl:px-12">
      <div className="prose prose-lg mx-auto max-w-4xl space-y-4">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Shipping & Delivery Policy
        </h1>

        <p>
          Thank you for visiting EducationalHub. This Shipping & Delivery Policy
          outlines how our services and products are delivered, as we are a
          purely digital platform.
        </p>

        <h2 className="font-Monument text-2xl">1. Nature of Our Products</h2>
        <p>
          EducationalHub provides digital educational content, including online
          courses, video materials, and other learning resources. **We do not
          sell or ship any physical products.** All our services are delivered
          electronically.
        </p>

        <h2 className="font-Monument text-2xl">
          2. &quot;Delivery&quot; of Services
        </h2>
        <p>
          &quot;Delivery&quot; in the context of our platform refers to granting
          you access to the digital content you have purchased or enrolled in.
        </p>
        <ul>
          <li>
            <strong>Immediate Access:</strong> Upon successful completion of
            your payment, you will receive immediate access to the course(s) or
            material(s).
          </li>
          <li>
            <strong>Account Dashboard:</strong> All your purchased content will
            be available in your personal account dashboard on the
            educationalhub.in website.
          </li>
          <li>
            <strong>Email Confirmation:</strong> You will receive a confirmation
            email to the email address provided during checkout. This email will
            serve as your receipt and will contain details on how to access your
            purchased content.
          </li>
        </ul>

        <h2 className="font-Monument text-2xl">3. No Shipping Charges</h2>
        <p>
          As all our products are digital, there are **no shipping charges,
          handling fees, or delivery timelines** associated with physical
          logistics. The price you see at checkout is the full price you pay for
          access.
        </p>

        <h2 className="font-Monument text-2xl">
          4. Issues with Access (Non-Delivery)
        </h2>
        <p>
          If you encounter any issues and do not receive access to your
          purchased content immediately after a successful payment, please:
        </p>
        <ol>
          <li>
            Check your email&apos;s spam or junk folder for our confirmation.
          </li>
          <li>
            Log in to your account on educationalhub.in and check your &quot;My
            Courses&quot; or dashboard section.
          </li>
          <li>
            If you still cannot find your content, please contact us
            immediately.
          </li>
        </ol>

        <h2 className="font-Monument text-2xl">5. Contact Us</h2>
        <p>
          For any questions regarding your purchase or access to our digital
          products, please contact us at:
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
