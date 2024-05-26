import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
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
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Messages = mongoose.model("messages", messageSchema);

export default Messages;
