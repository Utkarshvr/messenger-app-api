import FriendRequests from "@/models/FriendRequests.models";
import Friends from "@/models/Friends.models";
import { AuthenticatedRequest } from "@/types/express";
import { Response } from "express";

export async function getUsersFriends(
  req: AuthenticatedRequest,
  res: Response
) {
  const userID = req.user._id;
  try {
    const friends = await Friends.aggregate([
      {
        $match: {
          $or: [{ user1ID: userID }, { user2ID: userID }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user1ID",
          foreignField: "_id",
          as: "user1",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user2ID",
          foreignField: "_id",
          as: "user2",
        },
      },
      {
        $project: {
          friend: {
            $cond: {
              if: { $eq: ["$user1ID", userID] },
              then: { $arrayElemAt: ["$user2", 0] },
              else: { $arrayElemAt: ["$user1", 0] },
            },
          },
        },
      },
    ]);

    res.json({ friends });
  } catch (error) {
    console.log("::Error Fetching Friends::", error);
    res.status(500).json({ msg: `An Internal Error Occured`, error });
  }
}

export async function removeFriend(req: AuthenticatedRequest, res: Response) {
  const userID = req.user._id;
  const userToBeRemovedID = req.params.userID;

  if (userToBeRemovedID === userID)
    return res.status(400).json({ msg: `You can't remove yourself` });

  try {
    const request = await FriendRequests.findOne({
      $or: [{ sender: userToBeRemovedID }, { recipient: userToBeRemovedID }],
    });

    const friend = await Friends.findOne({
      $or: [{ user1ID: userToBeRemovedID }, { user2ID: userToBeRemovedID }],
    });

    if (userID === friend.user1ID || userID === friend.user2ID) {
      await friend.deleteOne();
      request.status = "unfriend";
      await request.save();

      res.json({ msg: "User has been unfriend" });
    } else return res.status(403).json({ msg: `Not authorized` });
  } catch (error) {
    console.log("::Removing Friend::", error);
    res.status(500).json({ msg: `An Internal Error Occured`, error });
  }
}
