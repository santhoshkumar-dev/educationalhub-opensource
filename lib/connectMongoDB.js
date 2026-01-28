import mongoose from "mongoose";
import CourseLike from "@/models/courseLike";
import Course from "@/models/course";
import Institution from "@/models/institution";
import Organization from "@/models/organization";
import Resource from "@/models/resources";
import University from "@/models/university";
import User from "@/models/userModel";
import Video from "@/models/videoModel";

// Track the connection status globally
let isConnected = false;

const connectMongoDB = async () => {
  // Check if already connected
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);

    await User.createIndexes();

    isConnected = true;

    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Ensure the error is propagated
  }
};

export default connectMongoDB;
