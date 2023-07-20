const express = require('express');

const router = express.Router();
const schemas = require('../../schemas/joi');
const models = require('../../controller/users');
const { auth } = require('../../middleware/auth');
const path = require('path');
const uploadDir = path.join(process.cwd(), 'tmp');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});
const upload = multer({
  storage: storage,
});

router.post('/register', upload.single('avatarURL'), async (req, res, next) => {
  try {
    const { error } = schemas.userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    const result = await models.registerUser(body);
    console.log(result);

    res
      .status(result.status)
      .json(
        result.message ? { message: result.message } : { user: result.user }
      );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/login', async (req, res, next) => {
  try {
    const { error } = schemas.userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    const result = await models.loginUser(body);
    if (result.status === 200) {
      req.headers.authorization = `Bearer ${result.token}`;
    }

    res
      .status(result.status)
      .json(
        result.message
          ? { message: result.message }
          : { token: result.token, user: result.user }
      );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/logout', auth, async (req, res, next) => {
  try {
    const { error } = schemas.userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    const result = await models.logOutUser(body, req);

    res
      .status(result.status)
      .json(
        result.message
          ? { message: result.message }
          : { token: result.token, user: result.user }
      );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/current', auth, async (req, res, next) => {
  try {
    const result = await models.current(req);
    res
      .status(result.status)
      .json(
        result.message
          ? { message: result.message }
          : { token: result.token, user: result.user }
      );
  } catch (e) {
    console.log(e);
  }
});
router.patch('/', auth, async (req, res, next) => {
  try {
    const result = await models.patchSubscription(req);
    res
      .status(result.status)
      .json(
        result.message ? { message: result.message } : { result: result.result }
      );
  } catch (e) {
    console.log(e);
  }
});
router.patch(
  '/avatars',
  upload.single('picture'),
  auth,
  async (req, res, next) => {
    const result = await models.uploadImage(req);
    console.log(result);
    try {
      res.status(result.status).json({ avatarURL: result.avatarURL });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);
router.get('/verify/:verificationToken', async (req, res) => {
  const { verificationToken } = req.params;
  const result = await models.verifyUser(verificationToken);

  try {
    res.status(result.status).json({ message: result.message });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/verify', async (req, res) => {
  const { error } = schemas.userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const result = await models.resendingEmail(req.body);

  try {
    res.status(result.status).json({ message: result.message });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
