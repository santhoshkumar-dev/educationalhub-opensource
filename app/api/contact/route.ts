// pages/api/contact.js
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  // Configure your email service
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New contact form submission from ${name}`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
    });

    return NextResponse.json({ message: "Mail Sent successfully" });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to send mail" }, { status: 500 });
  }
}
