import mongoose from "mongoose";

const FriendRequestschema = new mongoose.Schema(
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
    isSeenByReceiver: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected", "unfriend"],
    },
    no_of_attempts: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const FriendRequests = mongoose.model("friend-requests", FriendRequestschema);

export default FriendRequests;
