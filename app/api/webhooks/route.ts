// @ts-nocheck
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectMongoDB from "../../../lib/connectMongoDB";
import User from "../../../models/userModel";
import Session from "../../../models/sessionModel";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);
  console.log(" <--- EVENT TYPE --->", eventType);

  if (eventType === "session.created") {
    console.log("Session created event");

    const {
      id: sessionId,
      client_id,
      status,
      created_at,
      last_active_at,
      expire_at,
      abandon_at,
      updated_at,
      user_id,
    } = evt.data;

    const clientIp = evt.event_attributes?.http_request?.client_ip || null;
    const userAgent = evt.event_attributes?.http_request?.user_agent || null;

    await connectMongoDB();

    try {
      // Find the user to get their MongoDB ObjectId
      const user = await User.findOne({ clerk_id: user_id });

      if (!user) {
        console.log("User not found for session.created event");
        return new Response("User not found", { status: 404 });
      }

      // Check if session already exists
      const existingSession = await Session.findOne({ sessionId });
      if (existingSession) {
        console.log("Session already exists");
        return new Response("Session already exists", { status: 200 });
      }

      // Create new session record
      const newSession = new Session({
        sessionId,
        userId: user._id,
        clerkUserId: user_id,
        clientId: client_id,
        status: status,
        createdAt: new Date(created_at),
        lastActiveAt: new Date(last_active_at),
        expireAt: new Date(expire_at),
        abandonAt: new Date(abandon_at),
        updatedAt: new Date(updated_at),
        ip: clientIp,
        userAgent: userAgent,
      });

      await newSession.save();
      console.log("Session created and saved for user:", user.username);

      // Optional: Clean up old sessions (keep last 50 sessions per user)
      const sessionCount = await Session.countDocuments({
        clerkUserId: user_id,
      });
      if (sessionCount > 50) {
        const oldSessions = await Session.find({ clerkUserId: user_id })
          .sort({ createdAt: 1 })
          .limit(sessionCount - 50);

        const oldSessionIds = oldSessions.map((s) => s._id);
        await Session.deleteMany({ _id: { $in: oldSessionIds } });
        console.log(`Cleaned up ${oldSessionIds.length} old sessions`);
      }
    } catch (error) {
      console.error("Error saving session:", error);
      return new Response("Error occurred", { status: 500 });
    }
  }

  if (eventType === "session.removed") {
    console.log("Session removed event");

    const {
      id: sessionId,
      client_id,
      status,
      created_at,
      last_active_at,
      expire_at,
      abandon_at,
      updated_at,
      user_id,
    } = evt.data;

    const clientIp = evt.event_attributes?.http_request?.client_ip || null;
    const userAgent = evt.event_attributes?.http_request?.user_agent || null;

    await connectMongoDB();

    try {
      // Find and update the existing session
      const existingSession = await Session.findOne({ sessionId });

      if (existingSession) {
        // Update existing session with end details
        existingSession.status = "ended";
        existingSession.lastActiveAt = new Date(last_active_at);
        existingSession.updatedAt = new Date(updated_at);
        existingSession.endedAt = new Date();

        // Calculate duration
        if (existingSession.createdAt) {
          existingSession.duration =
            Date.now() - existingSession.createdAt.getTime();
        }

        await existingSession.save();
        console.log("Session updated as ended for sessionId:", sessionId);
      } else {
        // If session doesn't exist, create a new record with ended status
        const user = await User.findOne({ clerk_id: user_id });

        if (!user) {
          console.log("User not found for session.removed event");
          return new Response("User not found", { status: 404 });
        }

        const newSession = new Session({
          sessionId,
          userId: user._id,
          clerkUserId: user_id,
          clientId: client_id,
          status: "ended",
          createdAt: new Date(created_at),
          lastActiveAt: new Date(last_active_at),
          expireAt: new Date(expire_at),
          abandonAt: new Date(abandon_at),
          updatedAt: new Date(updated_at),
          endedAt: new Date(),
          ip: clientIp,
          userAgent: userAgent,
        });

        await newSession.save();
        console.log(
          "Session created with ended status for user:",
          user.username,
        );
      }
    } catch (error) {
      console.error("Error updating session:", error);
      return new Response("Error occurred", { status: 500 });
    }
  }

  if (eventType === "user.created") {
    console.log("User created event");

    // Extract relevant user data
    const userData = evt.data;
    const {
      email_addresses,
      profile_image_url,
      image_url,
      username,
      id,
      first_name,
      last_name,
    } = userData;

    // Connect to MongoDB
    await connectMongoDB();

    try {
      // if user already exists, return
      const existingUser = await User.findOne({ clerk_id: id });

      if (existingUser) {
        console.log("User already exists in database:", existingUser);
        return new Response("User already exists", {
          status: 200,
        });
      }

      // Save user to database
      const user = new User({
        username: username,
        first_name: first_name || "",
        last_name: last_name || "",
        email: email_addresses[0].email_address,
        profile_image_url: image_url || profile_image_url,
        clerk_id: id,
        created_at: new Date(),
        onboardingComplete: false,
      });
      await user.save();
      console.log("User saved to database:", user);
    } catch (error) {
      console.error("Error saving user to database:", error);
      return new Response("Error occurred", {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    console.log("User updated event");

    // Extract relevant user data
    const userData = evt.data;
    const {
      id,
      email_addresses,
      profile_image_url,
      image_url,
      username,
      public_metadata,
    } = userData;

    // Connect to MongoDB
    await connectMongoDB();

    try {
      // Find user in database
      const user = await User.findOne({ clerk_id: id });

      // Update user in database
      user.profile_image_url = image_url || profile_image_url;
      if (public_metadata?.role) {
        user.role = public_metadata.role;
      }
      await user.save();
      console.log("User updated in database:", user);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new Response("Error occurred", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    console.log("User deleted event");

    // Extract relevant user data
    const userData = evt.data;
    const { id } = userData;

    // Connect to MongoDB
    await connectMongoDB();

    try {
      // Find user in database
      const user = await User.findOne({ clerk_id: id });

      // Delete user from database
      await User.deleteOne({ clerk_id: id });
      console.log("User deleted from database:", user);
    } catch (error) {
      console.error("Error deleting user from database:", error);
      return new Response("Error occurred", {
        status: 500,
      });
    }
  }

  return new Response("", { status: 200 });
}

// GET method is not implemented for this route
export async function GET(req: Request) {
  console.log("GET method called on webhook route");

  return new Response("GET method not implemented", {
    status: 405, // Method Not Allowed
  });
}
