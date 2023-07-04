const express = require('express');

const router = express.Router();

const schemas = require('../../schemas/joi');

const models = require('../../controller/users');

router.post('/register', async (req, res, next) => {
  try {
    const { error } = schemas.userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    console.log(req.body);
    const result = await models.registerUser(body);
    console.log(result);

    res
      .status(result.status)
      .json({ user: result.user } || { message: result.message });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
