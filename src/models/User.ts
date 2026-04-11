import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  verificationOTP?: string;
  verificationOTPExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshTokens?: { token: string; deviceId?: string; createdAt: Date }[];
  loginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user', enum: ['user', 'admin'] },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpire: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    refreshTokens: [
      {
        token: { type: String, required: true },
        deviceId: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', userSchema);
export default User;
