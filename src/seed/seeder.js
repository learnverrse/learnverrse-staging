import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import CourseModel from '../modules/course/model/course.model.js';
import { CourseLevelEnum } from '../enums/course-level.enum.js';
import { CourseStatusEnums } from '../enums/course-status.enum.js';
import { CourseSubscriptionEnum } from '../enums/course-subscription.enum.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

const generateQuiz = () => ({
  quizId: faker.string.uuid(),
  question: faker.lorem.sentence(),
  text: faker.lorem.paragraph(),
});

const generateChapter = () => {
  const type = faker.helpers.arrayElement(['Text', 'Quiz', 'Video']);
  return {
    chapterId: faker.string.uuid(),
    type,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    video: type === 'Video' ? faker.internet.url() : undefined,
  };
};

const generateSection = () => ({
  sectionId: faker.string.uuid(),
  sectionTitle: faker.company.catchPhrase(),
  sectionDescription: faker.lorem.sentences(2),
  chapters: Array.from({ length: 10 }, generateChapter),
});

const generateCourse = () => ({
  educatorId: faker.string.uuid(),
  educatorName: faker.person.fullName(),
  title: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(2),
  category: faker.word.noun(),
  price: faker.number.float({ min: 10, max: 200 }),
  image: faker.image.url(),
  level: faker.helpers.arrayElement(Object.values(CourseLevelEnum)),
  status: faker.helpers.arrayElement(Object.values(CourseStatusEnums)),
  subscription: faker.helpers.arrayElement(
    Object.values(CourseSubscriptionEnum)
  ),
  isApproved: faker.datatype.boolean(),
  isFeatured: faker.datatype.boolean(),
  sections: Array.from({ length: 5 }, generateSection),
  quiz: Array.from({ length: 5 }, generateQuiz),
});

const seedCourses = async () => {
  await connectDB();
  await CourseModel.deleteMany({});
  const courses = Array.from({ length: 20 }, generateCourse);
  await CourseModel.insertMany(courses);
  console.log('20 dummy courses inserted');
  mongoose.disconnect();
};

seedCourses();
