import mongoose from "mongoose";

let isConnected = false; // track the connection

const connectToDB = async () => {
  // To enforce strict mode for queries
  mongoose.set("strictQuery", true);

  // This means that if you try to perform a query using undefined fields
  // or fields that are not defined in your Mongoose schema,
  // Mongoose will throw an error.

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "MessengerApp",
    });
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection error:", error);
    throw error; // Rethrow the error for the calling code to handle
  }
};

export default connectToDB;
