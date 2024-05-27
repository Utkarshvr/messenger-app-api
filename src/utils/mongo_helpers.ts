import Friends from "@/models/Friends.models";

export async function areFriends(user1ID: string, user2ID: string) {
  try {
    const friendshipExists = await Friends.findOne({
      $or: [
        { user1ID, user2ID },
        { user1ID: user2ID, user2ID: user1ID },
      ],
    }).lean();

    if (friendshipExists) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
