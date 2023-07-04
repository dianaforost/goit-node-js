const mongoose = require('mongoose');
const { Types } = require('mongoose');
require('dotenv').config();
const { DB_HOST } = process.env;
mongoose
  .connect(DB_HOST)
  .then(() => console.log('Database connection successful'))
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
const usersSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: String,
});

const User = mongoose.model('User', usersSchema);

const registerUser = async (body) => {
  try {
    const { email, password } = body;
    console.log(email, password);
    // const user = await User.findOne({ email });
    // if (user) {
    //   return { status: 409, message: 'Email in use' };
    // }
    if (email && password) {
      const result = await User.findOne({ email });
      if (result) {
        return { status: 409, message: 'Email in use' };
      }
      const newContact = {
        _id: new Types.ObjectId(),
        email,
        password,
      };
      console.log(JSON.stringify(result));
      const write = await User.create(newContact);
      console.log(write);
      return { status: 201, user: { email: email, password: password } };
    } else {
      return { status: 400, message: 'missing required name field' };
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  User,
  registerUser,
};
