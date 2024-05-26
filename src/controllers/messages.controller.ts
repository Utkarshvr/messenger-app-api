import Messages from "@/models/Messages.models";
import { AuthenticatedRequest } from "@/types/express";
import { Response } from "express";

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  const userId = req.user._id;

  try {
    const messages = await Messages.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).populate("sender recipient", "username");

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const { recipientId, text } = req.body;
  const senderId = req.user._id;

  try {
    const message = new Messages({
      sender: senderId,
      recipient: recipientId,
      text,
    });
    await message.save();
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
