import Conversations from "@/models/Conversations.models";
import Messages from "@/models/Messages.models";
import { AuthenticatedRequest } from "@/types/express";
import { Response } from "express";

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  const currentUserID = req.user._id;
  const conversationID = req.params.conversationID;

  try {
    const existingConv = await Conversations.findById(conversationID).lean();

    if (!existingConv)
      return res
        .status(400)
        .json({ msg: "No Conversation found with the provided ID" });

    const existingConvUsers = existingConv.users;
    const isCurrentUserPresent = existingConvUsers.some(
      (user_id) => user_id === currentUserID
    );
    if (!isCurrentUserPresent)
      return res
        .status(403)
        .json({ msg: "Unauthroized! You are not a part of the conversation" });
  } catch (error) {
    console.log(error);
  }

  try {
    const messages = (await Messages.find({
      conversation: conversationID,
    })
      .populate({
        path: "sender",
        select: "_id username",
      })
      .lean()) as unknown as {
      sender: {
        _id: string;
        username: string;
      };
    }[];

    const projectedMsgs = messages.map((msg) => ({
      ...msg,
      isSelf: msg.sender._id === currentUserID,
    }));

    res.status(200).json({ messages: projectedMsgs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const senderId = req.user._id;
  const conversationID = req.params.conversationID;

  const { body, image } = req.body;

  if (!body && !image)
    return res.status(400).json({ msg: "Provide at-least body or image" });

  try {
    const existingConv = await Conversations.findById(conversationID);

    if (!existingConv)
      return res
        .status(400)
        .json({ msg: "No Conversation found with the provided ID" });

    const message = await Messages.create({
      sender: senderId,
      conversation: conversationID,
      body,
      image,
      viewers: [senderId],
    });

    await existingConv.updateOne({
      hasInitiated: true,
      lastMessage: message._id,
      lastMessagedAt: new Date(),
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteMessage(req: AuthenticatedRequest, res: Response) {
  const senderId = req.user._id;
  const messageID = req.params.messageID;

  try {
    // const existingConv = await Conversations.findById(conversationID);

    // if (!existingConv)
    //   return res
    //     .status(400)
    //     .json({ msg: "No Conversation found with the provided ID" });

    const msg = await Messages.findOne({
      _id: messageID,
      sender: senderId,
    });
    const existingConv = await Conversations.findOne({
      _id: msg.conversation,
      users: {
        $in: [senderId],
      },
    });

    await msg.deleteOne();
    existingConv.lastMessagedAt = new Date();
    await existingConv.save();

    res.status(200).json({ msg: "Message has been deleted!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
