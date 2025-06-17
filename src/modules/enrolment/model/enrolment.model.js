import mongoose from 'mongoose';

const enrolmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const EnrolmentModel = mongoose.model('Enrolment', enrolmentSchema);
export default EnrolmentModel;
