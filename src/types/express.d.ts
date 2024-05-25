// express.d.ts
import { Request } from "express";

export interface clerkUserInterface {
  // Define the structure of your user object here
  // For example, if user has an ID, you can define it like this:
  _id: string | null;
  username: string | null;
  picture?: string | null;
  primaryEmail: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: clerkUserInterface;
}
