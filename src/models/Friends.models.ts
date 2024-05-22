import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      ref: "User",
      required: true,
    },
    recipient: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Friends = mongoose.model("Request", friendsSchema);

export default Friends;
