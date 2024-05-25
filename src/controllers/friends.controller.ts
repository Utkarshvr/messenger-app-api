import FriendRequests from "@/models/FriendRequests.models";
import Friends from "@/models/Friends.models";
import { Request, Response } from "express";

export async function removeFriend(req: Request, res: Response) {
  const userToBeRemovedID = req.params.userID;
  const userID = "user_2gx7CaoGsqHH7oMc1SK3cBE86Xe";
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
