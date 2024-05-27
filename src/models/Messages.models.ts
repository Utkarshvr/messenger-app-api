import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      ref: "User",
      required: true,
    },
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Convesation",
      required: true,
    },

    body: { type: String, required: false },
    image: { type: String, required: false },

    viewers: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Messages = mongoose.model("messages", messageSchema);

export default Messages;
