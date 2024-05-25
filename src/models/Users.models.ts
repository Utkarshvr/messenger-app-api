import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    email_addresses: {
      type: Object,
      required: true,
      unique: true,
    },
    primaryEmailID: {
      type: String,
      required: false,
    },
    picture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Users = mongoose.model("User", userSchema);

export default Users;
