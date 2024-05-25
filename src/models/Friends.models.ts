import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema(
  {
    user1ID: {
      type: String,
      ref: "User",
      required: true,
    },
    user2ID: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Friends = mongoose.model("friends", friendsSchema);

export default Friends;
