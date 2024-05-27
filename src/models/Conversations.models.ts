import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    name: String,
    isGroup: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    deletedBy: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    hasInitiated: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "messages",
    },
    lastMessagedAt: Date,
  },
  { timestamps: true }
);

const Conversations = mongoose.model("conversations", conversationSchema);

export default Conversations;
