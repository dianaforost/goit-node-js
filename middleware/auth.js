const jwt = require('jsonwebtoken');
const models = require('../controller/users');
const auth = async (req, res, next) => {
  try {
    const tok = req.headers.authorization.slice(7);
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decodedToken = jwt.verify(tok, 'Nodejs');

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await models.User.findById(decodedToken.id);

    if (!user || user.token !== tok) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports = {
  auth,
};
