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
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { versionKey: false }
);

const Contact = mongoose.model('Contact', contactSchema);

const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return JSON.stringify(contacts);
  } catch (error) {
    console.error(error);
  }
};
const getContactById = async (contactId) => {
  try {
    const result = await Contact.find();
    const contact = result.filter((c) => c.id === contactId);
    console.log(contactId);
    console.log(contact);
    return contact;
  } catch (e) {
    console.log(e);
  }
};

const removeContact = async (contactId) => {
  try {
    const result = await Contact.find();
    const contacts = result.filter((c) => c.id !== contactId);
    const write = await Contact.deleteOne({ _id: contactId });
    console.log(contacts, write);
    return contacts;
  } catch (e) {
    console.log(e);
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone, favorite } = body;
    console.log(name, email, phone);
    if (name && email && phone) {
      const result = await Contact.find();
      const newContact = {
        _id: new Types.ObjectId(),
        name,
        email,
        phone,
        favorite,
      };
      console.log(JSON.stringify(result));
      const write = await Contact.create(newContact);
      console.log(write);
      result.push(newContact);
      return { status: 200, result };
    } else {
      return { status: 400, message: 'missing required name field' };
    }
  } catch (e) {
    console.log(e);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const { name, email, phone } = body;
    if (name || email || phone) {
      const result = await Contact.find();
      const contact = result.findIndex((c) => c.id === contactId);

      if (contact !== -1) {
        if (name) {
          result[contact].name = name;
        }
        if (email) {
          result[contact].email = email;
        }
        if (phone) {
          result[contact].phone = phone;
        }

        await Contact.updateOne(
          { _id: contactId },
          { name, email, phone },
          { upsert: false }
        );

        return { status: 200, contact: result[contact] };
      } else {
        return { status: 404, message: 'Not found' };
      }
    } else {
      return { status: 400, message: 'missing fields' };
    }
  } catch (e) {
    console.log(e);
  }
};
const updateStatusContact = async (contactId, body) => {
  const { favorite } = body;
  try {
    if (favorite) {
      const result = await Contact.find();
      const contact = result.findIndex((c) => c.id === contactId);
      if (contact !== -1) {
        result[contact].favorite = favorite;
      } else {
        return { status: 404, message: 'Not found' };
      }
      await Contact.updateOne(
        { _id: contactId },
        { favorite },
        { upsert: false }
      );

      return { status: 200, contact: result[contact] };
    } else {
      return { status: 400, message: 'missing field favorite' };
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  Contact,
};
