// import mongoose from "mongoose";

// const mongoConnection = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.log("MongoDB connection failed:", error.message);
//     process.exit(1); // Exit the process with failure
//   }
// };

// export { mongoConnection };

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URL is not defined in environment variables");
}

// Optional: Customize Mongoose connection options
const options = {
  autoIndex: false, // Disable in production for performance
  maxPoolSize: 50, // Connection pool size
  serverSelectionTimeoutMS: 5000, // Timeout for initial connection
  socketTimeoutMS: 45000,
  family: 4, // IPv4 only
};

let isConnected = false;

const mongoConnection = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, options);
    isConnected = true;

    console.log(`✅ MongoDB connected: ${db.connection.host}`);

    // Optional: Log additional events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export { mongoConnection };
