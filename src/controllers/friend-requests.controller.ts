import { Response } from "express";
import { AuthenticatedRequest } from "@/types/express";
import Friends from "@/models/Friends.models";
import FriendRequests from "@/models/FriendRequests.models";
import Users from "@/models/Users.models";

export async function getUserRequests(
  req: AuthenticatedRequest,
  res: Response
) {
  // const userID = "user_2gx7CaoGsqHH7oMc1SK3cBE86Xe";
  const userID = req.user?._id;
  const type: string = req.params.type;

  if (type && type !== "sent" && type !== "received")
    return res.status(400).json({ msg: "type parameter is not vaild" });

  try {
    const receivedRequests = await FriendRequests.find({
      ...(type === "received" ? { recipient: userID } : { sender: userID }),
      status: "pending",
    }).populate("sender");

    res.json({ receivedRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function sendRequest(req: AuthenticatedRequest, res: Response) {
  // Get loggedin user's ID
  const senderID = req.user?._id;
  const recipientID = req.params.recipientID;
  console.log({ recipientID });
  // Check if a user exists with recipientID
  try {
    const user = await Users.findOne({ _id: recipientID }).lean();
    // console.log({ user });

    if (!user)
      return res
        .status(404)
        .json({ msg: `No User with ID: ${recipientID} exists` });

    try {
      const requestExists = await FriendRequests.findOne({
        sender: senderID,
        recipient: recipientID,
      });

      if (requestExists) {
        if (requestExists.status === "pending")
          return res.json({ msg: "Request is already pending!" });
        else if (requestExists.status === "accepted")
          return res.json({ msg: "Already friends!" });
        else {
          requestExists.status = "pending";
          requestExists.isSeenByReceiver = false;
          requestExists.no_of_attempts = requestExists.no_of_attempts + 1;
          await requestExists.save();

          res.json({ msg: "Request is sent again!", request: requestExists });
        }
      } else {
        const newReq = await FriendRequests.create({
          sender: senderID,
          recipient: recipientID,
        });
        res.json({ msg: "Request sent!", request: newReq });
      }
    } catch (error) {
      console.log("::FriendRequests.create::", error);
      res.status(500).json({ msg: `An Internal Error Occured` });
    }
  } catch (error) {
    console.log("::Finding Recipient::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function accpetRequest(req: AuthenticatedRequest, res: Response) {
  // Get loggedin user's ID
  const userID = req.user?._id;
  const requestID = req.params.requestID;

  try {
    const request = await FriendRequests.findById(requestID);
    if (!request)
      return res
        .status(404)
        .json({ msg: `Request with ID ${requestID} doesn't exist` });

    // Check if the receiver of the request is the logged in user
    if (request.recipient !== userID)
      return res.status(403).json({
        msg: "Unauthroized! You are not the recipient of the request",
      });

    if (request.status === "rejected")
      return res.status(400).json({
        msg: "Can't accept a request that has once been rejected",
      });

    // If it's the user
    await Friends.create({
      user1ID: request.sender,
      user2ID: request.recipient,
    });
    request.status = "accepted";
    await request.save();

    res.status(201).json({ msg: "Added to the friend list" });
  } catch (error) {
    console.log("::FriendRequests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}
export async function rejectRequest(req: AuthenticatedRequest, res: Response) {
  // Get loggedin user's ID
  const userID = req.user?._id;
  const requestID = req.params.requestID;

  try {
    const request = await FriendRequests.findById(requestID);

    if (!request)
      return res
        .status(404)
        .json({ msg: `Request with ID ${requestID} doesn't exist` });

    // Check if the receiver of the request is the logged in user
    if (request.recipient !== userID)
      return res.status(403).json({
        msg: "Unauthroized! You are not the recipient of the request",
      });

    request.status = "rejected";
    await request.save();

    res.status(201).json({ msg: "Rejected the requests" });
  } catch (error) {
    console.log("::FriendRequests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}
export async function cancelRequest(req: AuthenticatedRequest, res: Response) {
  // Get loggedin user's ID
  const userID = req.user?._id;
  const requestID = req.params.requestID;

  try {
    const request = await FriendRequests.findById(requestID);

    if (!request)
      return res
        .status(404)
        .json({ msg: `Request with ID ${requestID} doesn't exist` });

    // Check if the receiver of the request is the logged in user
    if (request.sender !== userID)
      return res.status(403).json({
        msg: "Unauthroized! You are not the recipient of the request",
      });
    await request.deleteOne();

    res.status(201).json({ msg: "The request is cancelled" });
  } catch (error) {
    console.log("::FriendRequests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function markAllRequestsAsSeen(
  req: AuthenticatedRequest,
  res: Response
) {
  // Get loggedin user's ID
  const userID = req.user._id;

  try {
    await FriendRequests.updateMany(
      { recipient: userID, isSeenByReceiver: false },
      { $set: { isSeenByReceiver: true } }
    );

    return res.json({ msg: "All Requests are marked as seen" });
  } catch (error) {
    console.log("::FriendRequests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured`, error });
  }
}
