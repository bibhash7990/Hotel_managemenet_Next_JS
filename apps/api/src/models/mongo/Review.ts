import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    hotelId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    helpfulCount: { type: Number, default: 0 },
    moderationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewSchema.index({ hotelId: 1, moderationStatus: 1 });

export const ReviewModel =
  mongoose.models.Review ?? mongoose.model('Review', ReviewSchema, 'reviews');
