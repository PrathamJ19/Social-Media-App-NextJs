import { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export interface Comment extends Document {
  author: User; // The 'author' should be a reference to the User model
  content: string;
  createdAt: Date;
}
