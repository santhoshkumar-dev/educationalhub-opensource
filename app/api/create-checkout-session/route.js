// pages/api/create-checkout-session.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export async function POST(req) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const baseUrl = `${protocol}://${req.headers.host}`;

    const { courseName, coursePrice } = await req.json();
    const unitAmount = coursePrice * 100;

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: courseName,
    //         },
    //         unit_amount: unitAmount,
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: `${baseUrl}/success`,
    //   cancel_url: `${baseUrl}/cancel`,
    // });

    // session with image, description and metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: courseName,
              images: ["https://placeholder.co/2000x2000"],
              description: "Comfortable cotton t-shirt",
              metadata: { courseName },
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
