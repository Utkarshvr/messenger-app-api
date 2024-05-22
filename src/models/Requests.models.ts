import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
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
    isRead: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Requests = mongoose.model("Request", requestSchema);

export default Requests;
