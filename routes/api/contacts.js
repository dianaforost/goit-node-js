const express = require('express');

const router = express.Router();

const Joi = require('joi');

const contactPostSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});
const contactPutSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
});

const models = require('../../models/contacts');
router.get('/', async (req, res, next) => {
  try {
    const contacts = JSON.parse(await models.listContacts());
    console.log(contacts);
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await models.getContactById(contactId);
    if (contact) {
      console.log(contact);
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = contactPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = req.body;
    console.log(req.body);
    const result = await models.addContact(body);

    res.status(result.status).json(result.result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:contactId', async (req, res, next) => {
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

router.put('/:contactId', async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = contactPutSchema.validate(req.body);
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

module.exports = router;
