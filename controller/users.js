const mongoose = require('mongoose');
const { Types } = require('mongoose');
require('dotenv').config();
const { DB_HOST, secret } = process.env;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const uploadDir = path.join(process.cwd(), 'tmp');
const storeImage = path.join(process.cwd(), 'public/avatars');
const fs = require('fs').promises;
const jimp = require('jimp');
const fetch = require('node-fetch');
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
  avatarURL: String,
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
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
      const avatarURL = gravatar.url(email, { s: '100', r: 'x' }, true);
      const result = await User.findOne({ email });
      if (result) {
        return { status: 409, message: 'Email in use' };
      }
      const newUser = new User({
        _id: new Types.ObjectId(),
        email,
        avatarURL,
      });
      newUser.setPassword(password);
      const avatarFileName = `${email}.png`;
      const response = await fetch(avatarURL);
      const buffer = await response.buffer();
      const filePath = path.join(uploadDir, avatarFileName);
      fs.writeFile(filePath, buffer);
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
const uploadImage = async (req) => {
  try {
    const token = req.headers.authorization.slice(7);
    const verify = jwt.verify(token, secret);

    const user = await User.findById(verify.id);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const avatarPath = path.join(uploadDir, `${verify.email}.png`);
    if (!avatarPath) {
      return { status: 404, message: 'Sorry' };
    }
    const image = await jimp.read(avatarPath);
    image.cover(250, 250);

    const processedAvatarPath = path.join(storeImage, `${verify.email}.png`);
    await image.writeAsync(processedAvatarPath);

    fs.unlink(avatarPath);

    const avatarURL = `/avatars/${verify.email}.png`;
    user.avatarURL = avatarURL;
    return { status: 200, avatarURL: avatarURL };
  } catch (error) {
    console.error('Помилка при обробці аватарки:', error);
    return { status: 500, avatarURL: 'sORRY' };
  }
};
const verify = async (verificationToken) => {
  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return { status: 404, message: 'User not found' };
    }
    user.verificationToken = null;
    user.verify = true;
    await user.save();
    return { status: 200, message: 'Verification successful' };
  } catch (e) {
    console.log(e);
    return { status: 500, message: 'Internal Server Error' };
  }
};
module.exports = {
  User,
  registerUser,
  loginUser,
  logOutUser,
  current,
  patchSubscription,
  uploadImage,
  verify,
};
