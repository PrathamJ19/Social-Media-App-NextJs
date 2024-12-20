import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: {
    type: String,
    default: 'https://faizawsbucket.s3.amazonaws.com/default-profile-pic.jpg',
  },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  followers: string[];
  following: string[];
}
