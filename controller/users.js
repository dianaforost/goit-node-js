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
  this.password = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10));
};

usersSchema.methods.validPassword = function (password) {
  const isPasswordValid = bcryptjs.compareSync(password, this.password);
  return isPasswordValid;
};
const User = mongoose.model('User', usersSchema);

const registerUser = async (body) => {
  try {
    const { email, password } = body;
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
      await newUser.save();
      const write = await User.create(newUser);
      const writes = await newUser.save();
      console.log(write, writes);
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

      if (!result.validPassword(password)) {
        return { status: 401, message: 'Email or password is wrong' };
      } else {
        const payload = {
          id: result.id,
          email: result.email,
          password: result.password,
          subscription: result.subscription,
        };
        const token = jwt.sign(payload, secret, { expiresIn: '1w' });
        result.token = token;
        await result.save();
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
const logOutUser = async (body, req) => {
  try {
    const verify = jwt.verify(req.headers.authorization.slice(7), secret);
    const id = verify.id;
    if (id) {
      const result = await User.findById(id);
      if (!result) {
        return { status: 401, message: 'Not authorized' };
      }
      result.token = null;

      await result.save();
      return { status: 204, message: 'Token deleted successfully' };
    }
  } catch (e) {
    console.log(e);
  }
};
const current = async (req) => {
  try {
    const token = req.headers.authorization.slice(7);
    const verify = jwt.verify(token, secret);
    if (!verify) {
      return { status: 401, message: 'Not authorized' };
    }
    return {
      status: 200,
      user: { email: verify.email, subscription: verify.subscription },
    };
  } catch (e) {
    console.log(e);
  }
};
const patchSubscription = async (req) => {
  const { subscription } = req.body;
  const allowedSubscriptions = ['starter', 'pro', 'business'];
  if (!allowedSubscriptions.includes(subscription)) {
    return { status: 400, message: 'Invalid subscription value' };
  }
  const userId = req.user.id;
  const result = await User.findByIdAndUpdate(userId, { subscription });
  result.subscription = subscription;
  return { status: 200, result: result };
};
module.exports = {
  User,
  registerUser,
  loginUser,
  logOutUser,
  current,
  patchSubscription,
};
