import mongoose, { Schema } from 'mongoose';

const FcmTokenSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const FcmTokenModel =
  mongoose.models.FcmToken ?? mongoose.model('FcmToken', FcmTokenSchema, 'fcm_tokens');
