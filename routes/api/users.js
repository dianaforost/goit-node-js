const express = require('express');

const router = express.Router();
// const jwt = require('jsonwebtoken');
const schemas = require('../../schemas/joi');
// const { secret } = process.env;
const models = require('../../controller/users');
const { auth } = require('../../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { error } = schemas.userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    const result = await models.registerUser(body);

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
module.exports = router;
