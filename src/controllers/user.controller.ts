import FriendRequests from "@/models/FriendRequests.models";
import Friends from "@/models/Friends.models";
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

// export async function getAllSuggestedUsers(
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<void> {
//   const userID = req.user._id;

//   try {
//     // Aggregate to filter out suggested users
//     const suggestedUsers = await Users.aggregate([
//       // Match users not equal to the logged-in user
//       { $match: { _id: { $ne: userID } } },
//       // Lookup to check if any friend requests exist
//       {
//         $lookup: {
//           from: "friend-requests",
//           let: { userID: userID },
//           pipeline: [],
//           as: "friendRequests",
//         },
//       },
//       // Unwind friendRequests array
//       {
//         $unwind: { path: "$friendRequests", preserveNullAndEmptyArrays: true },
//       },
//       // Group by user ID to count friendRequests
//       {
//         $group: {
//           _id: "$_id",
//           user: { $first: "$$ROOT" }, // Keep the entire user document
//           count: {
//             $sum: { $cond: [{ $ifNull: ["$friendRequests", false] }, 1, 0] },
//           },
//         },
//       },
//       // Filter out users with friend requests
//       { $match: { count: 0 } },
//       // Project to include user details and rename _id field
//       {
//         $project: {
//           _id: "$user._id",
//           username: "$user.username",
//           email_addresses: "$user.email_addresses",
//           primaryEmailID: "$user.primaryEmailID",
//           picture: "$user.picture",
//         },
//       },
//     ]);

//     console.log({ suggestedUsers });

//     res.status(200).json({ users: suggestedUsers });
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Error retrieving suggested users", error });
//   }
// }

// export async function getAllSuggestedUsers(
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<void> {
//   const userID = req.user._id;

//   try {
//     // Aggregate to filter out suggested users
//     const suggestedUsers = await Users.aggregate([
//       // Match users not equal to the logged-in user
//       { $match: { _id: { $ne: userID } } },
//       // Lookup to check if any friend requests exist
//       {
//         $lookup: {
//           from: "friend-requests",
//           let: { userID: userID },
//           pipeline: [],
//           as: "friendRequests",
//         },
//       },
//       // Unwind friendRequests array
//       {
//         $unwind: { path: "$friendRequests", preserveNullAndEmptyArrays: true },
//       },
//       // Group by user ID to count friendRequests
//       {
//         $group: {
//           _id: "$_id",
//           user: { $first: "$$ROOT" }, // Keep the entire user document
//           count: {
//             $sum: { $cond: [{ $ifNull: ["$friendRequests", false] }, 1, 0] },
//           },
//         },
//       },
//       // Match users with no friend requests or friend requests with status other than 'pending'
//       {
//         $match: {
//           $or: [
//             { count: 0 }, // No friend requests
//             { "user.friendRequests.status": { $ne: "pending" } }, // Non-pending friend requests
//           ],
//         },
//       },
//       // Project to include user details
//       {
//         $project: {
//           _id: "$user._id",
//           username: "$user.username",
//           email_addresses: "$user.email_addresses",
//           primaryEmailID: "$user.primaryEmailID",
//           picture: "$user.picture",
//         },
//       },
//     ]);
//     // console.log({ suggestedUsers });
//     res.status(200).json({ users: suggestedUsers });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving suggested users", error });
//   }
// }

export async function getAllSuggestedUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userID = req.user._id;

  try {
    const users = await Users.find();
    const friendRequests = await FriendRequests.find();
    const friends = await Friends.find();

    // Aggregate to filter out suggested users
    const suggestedUsers = users
      .filter((user) => user._id !== userID)
      .map((user) => {
        const friendReq = friendRequests.find(
          (req) =>
            (req.sender === userID && req.recipient === user._id) ||
            (req.recipient === userID && req.sender === user._id)
        );

        const hasFriendRequestsWhichIsPending =
          friendReq && friendReq.status === "pending";

        const hasFriendship = friends.some(
          (friend) =>
            (friend.user1ID === userID && friend.user2ID === user._id) ||
            (friend.user2ID === userID && friend.user1ID === user._id)
        );
        if (!hasFriendRequestsWhichIsPending && !hasFriendship) {
          return {
            _id: user._id,
            username: user.username,
            email_addresses: user.email_addresses,
            primaryEmailID: user.primaryEmailID,
            picture: user.picture,
          };
        }
      })
      .filter(Boolean); // Remove undefined values

    console.log({ suggestedUsers });
    res.status(200).json({ users: suggestedUsers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving suggested users", error });
  }
}
