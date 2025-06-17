import argon2 from 'argon2';
import logger from './logger.js';

export const hashPassword = async (password) => {
  try {
    const hashValue = await argon2.hash(password);

    return hashValue;
  } catch (error) {
    logger.error(`Argon2 hashing error ${error.message}`);
  }
};

export const comparePassword = async (password, candidatePassword) =>
  await argon2.verify(password, candidatePassword);
