import mongoose, { Schema } from 'mongoose';
import { CourseLevelEnum } from '../../../enums/course-level.enum.js';
import { CourseStatusEnums } from '../../../enums/course-status.enum.js';
import { CourseSubscriptionEnum } from '../../../enums/course-subscription.enum.js';

// quiz Schema
const quizSchema = new Schema({
  quizId: { type: String, required: true },
  question: { type: String },
  text: { type: String },
});

// Chapter Schema
const chapterSchema = new Schema({
  chapterId: { type: String, required: true },
  type: {
    type: String,
    enum: ['Text', 'Quiz', 'Video'],
  },
  title: { type: String },
  content: { type: String },
  video: { type: String },
});

// Section Schema
const sectionSchema = new Schema({
  sectionId: { type: String, required: true },
  sectionTitle: { type: String },
  sectionDescription: { type: String },
  chapters: [chapterSchema],
});

const courseSchema = new mongoose.Schema(
  {
    educatorId: {
      type: String,
      required: true,
      trim: true,
    },
    educatorName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(CourseLevelEnum),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatusEnums),
      default: 'DRAFT',
      required: true,
    },
    subscription: {
      type: String,
      enum: Object.values(CourseSubscriptionEnum),
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sections: [sectionSchema],
    quiz: [quizSchema],
  },
  { timestamps: true }
);

const CourseModel = mongoose.model('Course', courseSchema);
export default CourseModel;
