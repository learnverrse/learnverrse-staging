import mongoose, { Schema } from 'mongoose';

import { comparePassword } from '../../../utils/argonPassword.js';
import { UserRoleEnum } from '../../../enums/user-role.enum.js';
import { ProviderEnum } from '../../../enums/account-provider.enum.js';

const AccountSchema = new Schema({
  provider: {
    type: String,
    enum: Object.values(ProviderEnum),
    required: true,
  },
  providerId: {
    type: String,
    required: true,
    unique: true,
  },
  googleAccessToken: String,
  googleRefreshToken: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: 'learner',
      required: true,
    },

    isRoleVerified: {
      type: Boolean,
      required: true,
      default: false, //An educator must have his role verified
    },
    profilePicture: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    account: AccountSchema,
  },
  { timestamps: true }
);

userSchema.methods.omitPassword = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.verifyPassword = async function (candidatePassword) {
  return comparePassword(this.password, candidatePassword);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
