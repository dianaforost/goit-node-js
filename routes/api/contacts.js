const express = require('express');

const router = express.Router();

const schemas = require('../../schemas/joi');
const models = require('../../controller/contacts');
const jwt = require('jsonwebtoken');
const { auth } = require('../../middleware/auth');
router.get('/', auth, async (req, res, next) => {
  try {
    const { page, limit = 5 } = req.query;
    const verify = jwt.verify(req.headers.authorization.slice(7), 'Nodejs');
    if (page && limit) {
      const result = await models.listContacts(Number(page), Number(limit), {
        owner: verify.id,
      });
      return res.status(200).json({
        contacts: result.contacts,
        total: result.total,
        page: page,
      });
    }
    const contacts = await models.listContacts({
      owner: verify.id,
    });
    const isFavourite = req.query.favorite;
    if (isFavourite === 'true') {
      const result = await models.filterContacts(req);
      return res.status(200).json(result.contacts);
    }
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:contactId', auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await models.getContactById(contactId);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { error } = schemas.contactPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    const result = await models.addContact(body, { owner: req.user._id });

    res.status(result.status).json(result.result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:contactId', auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contacts = await models.removeContact(contactId);
    if (contactId) {
      res.status(200).json({ message: 'contact deleted' });
      console.log(contacts);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:contactId', auth, async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = schemas.contactPutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const result = await models.updateContact(contactId, body);
    if (result.status === 200) {
      res.status(200).json(result.contact);
    } else if (result.status === 404) {
      res.status(404).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.patch('/:contactId/favorite', auth, async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = schemas.contactPatchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const result = await models.updateStatusContact(contactId, body);
    if (result.status === 200) {
      res.status(200).json(result.contact);
    } else if (result.status === 404) {
      res.status(404).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
