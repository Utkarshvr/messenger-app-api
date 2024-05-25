import Users from "@/models/Users.models";
import { AuthenticatedRequest } from "@/types/express";
import { Response } from "express";

export async function getAllUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userID = req.user._id;

  try {
    const users = await Users.find({ _id: { $ne: userID } });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
}

export async function getAllSuggestedUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userID = req.user._id;

  try {
    const users = await Users.find({ _id: { $ne: userID } });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
}
