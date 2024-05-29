import pusher from "@/lib/pusher";
import Conversations from "@/models/Conversations.models";
import Messages from "@/models/Messages.models";
import { AuthenticatedRequest } from "@/types/express";
import { areFriends } from "@/utils/mongo_helpers";
import { Response } from "express";

// GET
export async function getUsersConversations(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;

  try {
    const conversations = await Conversations.find({
      hasInitiated: true,
      users: {
        $in: [currentUserID],
      },
    })
      .sort({ lastMessagedAt: -1 })
      .populate({
        path: "users",
        select: "_id username picture",
      })
      .populate("lastMessage");

    res.json({ conversations });
  } catch (error) {
    res.json({ error });
  }
}

// GET
export async function getConversationByID(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;
  const conversationID = req.params.conversationID;

  try {
    const conversation = await Conversations.findOne({
      _id: conversationID,
      users: {
        $in: [currentUserID],
      },
    }).populate({
      path: "users",
      select: "_id username picture",
    });

    res.json({ conversation });
  } catch (error) {
    res.json({ error });
  }
}

// POST
export async function createConversation(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;
  const { name, isGroup, members, userID } = req.body;

  let membersExcludingCurrentUser = null;
  if (members && Array.isArray(members))
    membersExcludingCurrentUser = members?.filter(
      (m: { _id: string }) => m._id !== currentUserID
    );

  const isSelfConvo = currentUserID === userID;

  //   VALIDATIONS
  if (!currentUserID || !userID)
    return res.status(401).json({ msg: "Unathorized" });

  if (
    isGroup === true &&
    (!membersExcludingCurrentUser ||
      membersExcludingCurrentUser?.length < 2 ||
      !name)
  )
    return res.status(400).json({ msg: "Invalid Data" });

  //   MAIN
  if (isGroup === true) {
    // Check if these users are friends
    for (const member of membersExcludingCurrentUser) {
      const friendShipExists = await areFriends(currentUserID, member?._id);

      if (!friendShipExists) {
        return res.status(400).json({
          msg: "Can't create a conversation with a user with whom you are not friends",
        });
      }
    }

    // If all users are friends, proceed with the rest of the code
    try {
      const newConv = await Conversations.create({
        name,
        isGroup,
        users: [
          currentUserID,
          ...membersExcludingCurrentUser.map((m: { _id: string }) => m?._id),
        ],
      });
      const newConvPopulated = await newConv.populate("users");
      return res.status(201).json({ conversation: newConvPopulated });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  if (!isSelfConvo) {
    // Check if these users are friends
    const friendShipExists = await areFriends(currentUserID, userID);
    if (!friendShipExists) {
      return res.status(400).json({
        msg: "Can't create a conversation with a user with whom you are not friends",
      });
    }
  }

  try {
    const existingConversation = await Conversations.findOne({
      users: {
        $all: [currentUserID, userID],
        $size: 2,
      },
    });
    if (existingConversation) {
      const populatedConv = await existingConversation.populate("users");
      return res.json({ conversation: populatedConv });
    }

    // Create if not already exists
    const newConv = await Conversations.create({
      users: [currentUserID, userID],
    });
    const newConvPopulated = await newConv.populate("users");
    return res.status(201).json({ conversation: newConvPopulated });
  } catch (error) {
    res.json({ error });
  }
}

// GET
export async function getUnseenMsgCountByConvID(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;
  const conversationID = req.params.conversationID;

  const existingConv = await Conversations.findOne({
    _id: conversationID,
    users: {
      $in: [currentUserID],
    },
  }).lean();
  if (!existingConv)
    return res.status(404).json({
      msg: "Couldn't find a conversation with this id of which you are part of",
    });

  try {
    const unseenMessages = await Messages.find({
      conversation: conversationID,

      viewers: {
        $nin: [currentUserID],
      },
    });
    console.log({ unseenMessages });

    res.json({ count: unseenMessages.length });
  } catch (error) {
    res.json({ error });
  }
}

// PUT
export async function markUnseenMsgsAsSeen(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;
  const conversationID = req.params.conversationID;

  const existingConv = await Conversations.findOne({
    _id: conversationID,
    users: {
      $in: [currentUserID],
    },
  }).lean();

  if (!existingConv)
    return res.status(404).json({
      msg: "Couldn't find a conversation with this id of which you are part of",
    });

  try {
    await Messages.updateMany(
      {
        conversation: conversationID,

        viewers: {
          $nin: [currentUserID],
        },
      },
      {
        $push: { viewers: currentUserID },
      }
    );

    await pusher.trigger(conversationID, "conversation:seen", {
      viewer: currentUserID,
    });

    await pusher.trigger(`MESSAGES-${conversationID}`, "conversation:seen", {
      viewer: currentUserID,
    });

    res.json({
      msg: "All messages of this conversation have been marked as seen",
    });
  } catch (error) {
    res.json({ error });
  }
}

// PUT
export async function deleteConversation(
  req: AuthenticatedRequest,
  res: Response
) {
  const currentUserID = req.user?._id;
  const conversationID = req.params.conversationID;

  try {
    const existingConv = await Conversations.findOne({
      _id: conversationID,
      users: {
        $in: [currentUserID],
      },
    });
    if (!existingConv)
      return res.status(404).json({
        msg: "Couldn't find a conversation with this id of which you are part of",
      });

    const deletedBy = existingConv.deletedBy;
    const users = existingConv.users;

    const UsersWhoDidNotDeletedConvo = users.filter(
      (user) => user !== deletedBy.find((u) => u === user)
    );

    if (
      UsersWhoDidNotDeletedConvo.length === 1 &&
      UsersWhoDidNotDeletedConvo[0] === currentUserID
    ) {
      // DELETE THE CONVO ALONG WITH ALL THE MESSAGES
      await existingConv.deleteOne();

      await Messages.deleteMany({ conversation: conversationID });
      return res.json({
        msg: "The conversation has been deleted.",
      });
    }

    // Else push the currentUserID who wants to delete the convo in the deletedBy Array
    deletedBy.push(currentUserID);
    await existingConv.save();

    res.json({
      msg: "The conversation has been deleted.",
    });
  } catch (error) {
    res.json({ error });
  }
}
