import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phoneNumber: { type: String, required: true, trim: true },
  birthdate: { type: Date, required: true },
  url_profile: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
