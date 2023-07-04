const mongoose = require('mongoose');
const { Types } = require('mongoose');
require('dotenv').config();
const { DB_HOST, secret } = process.env;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
usersSchema.methods.setPassword = function (password) {
  this.password = bcryptjs.hashSync(password, bcryptjs.genSaltSync(6));
};

usersSchema.methods.validPassword = function (password) {
  return bcryptjs.compareSync(password, this.password);
};
const User = mongoose.model('User', usersSchema);

const registerUser = async (body) => {
  try {
    const { email, password } = body;
    console.log(email, password);
    if (email && password) {
      const result = await User.findOne({ email });
      if (result) {
        return { status: 409, message: 'Email in use' };
      }
      const newUser = new User({
        _id: new Types.ObjectId(),
        email,
      });
      newUser.setPassword(password);
      console.log(JSON.stringify(result));
      const write = await User.create(newUser);
      console.log(write);
      return { status: 201, user: { email: email, password: password } };
    } else {
      return { status: 400, message: 'missing required name field' };
    }
  } catch (e) {
    console.log(e);
  }
};
const loginUser = async (body) => {
  try {
    const { email, password } = body;
    if (email && password) {
      const result = await User.findOne({ email });
      if (!result || !result.validPassword(password)) {
        return { status: 401, message: 'Email or password is wrong' };
      } else {
        const payload = {
          id: result.id,
          email: result.email,
          password: result.password,
        };
        const token = jwt.sign(payload, secret, { expiresIn: '1d' });
        return {
          status: 200,
          token: token,
          user: { email: email, subscription: result.subscription },
        };
      }
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
  loginUser,
};
