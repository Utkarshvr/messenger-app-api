import Friends from "@/models/Friends.models";
import Requests from "@/models/Requests.models";
import Users from "@/models/Users.models";
import { Request, Response } from "express";

export async function getUserRequests(req: Request, res: Response) {
  const userID = "user_2gmBZCio3JBDsSZ7GRTCLbaFN93";
  const type = req.query.type;

  try {
    if (type === "sent") {
      const sentRequests = await Requests.find({ sender: userID }).populate(
        "recipient"
      );
      res.json({ sentRequests });
    } else {
      const receivedRequests = await Requests.find({
        recipient: userID,
      }).populate("sender");
      res.json({ receivedRequests });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function createRequest(req: Request, res: Response) {
  // Get loggedin user's ID
  const senderID = "user_2gmBZCio3JBDsSZ7GRTCLbaFN93";
  const recipientID = req.params.recipientID;
  console.log({ recipientID });
  // Check if a user exists with recipientID
  try {
    const user = await Users.findOne({ _id: recipientID }).lean();
    console.log({ user });

    if (!user)
      return res
        .status(404)
        .json({ msg: `No User with ID: ${recipientID} exists` });

    try {
      const requestExists = await Requests.findOne({
        sender: senderID,
        recipient: recipientID,
      });
      if (requestExists)
        return res.json({ msg: "Request is already pending!" });

      await Requests.create({ sender: senderID, recipient: recipientID });
      res.json({ msg: "Request sent!" });
    } catch (error) {
      console.log("::Requests.create::", error);
      res.status(500).json({ msg: `An Internal Error Occured` });
    }
  } catch (error) {
    console.log("::Finding Recipient::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function accpetRequest(req: Request, res: Response) {
  // Get loggedin user's ID
  const userID = "user_2gmBZCio3JBDsSZ7GRTCLbaFN93";
  const requestID = req.params.requestID;

  try {
    const request = await Requests.findById(requestID);

    // Check if the receiver of the request is the logged in user
    if (request.recipient !== userID)
      return res.status(403).json({
        msg: "Unauthroized! You are not the recipient of the request",
      });

    // If it's the user
    await Friends.create({
      sender: request.sender,
      recipient: request.recipient,
    });
    request.isAccepted = true;

    res.status(201).json({ msg: "Added to the friend list" });
  } catch (error) {
    console.log("::Requests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}

export async function markRequestAsSeen(req: Request, res: Response) {
  // Get loggedin user's ID
  const requestID = req.params.requestID;
  const userID = "user_2gmBZCio3JBDsSZ7GRTCLbaFN93";

  try {
    const request = await Requests.findById(requestID);
    if (request.recipient === userID) request.isRead = true;
    await request.save();
    return res.json({ msg: "Request is seen" });
  } catch (error) {
    console.log("::Requests.create::", error);
    res.status(500).json({ msg: `An Internal Error Occured` });
  }
}
