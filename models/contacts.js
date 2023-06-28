const fs = require('fs/promises');
const path = require('path');
const contactsPath = path.join(__dirname, 'contacts.json');
const mongoose = require('mongoose');
const DB_HOST =
  'mongodb+srv://dianaforost:Chokolate2005@cluster0.veict56.mongodb.net/db-contacts?retryWrites=true&w=majority';
mongoose
  .connect(DB_HOST)
  .then(() => console.log('Database connection successful'))
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
const contactSchema = new mongoose.Schema({
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
});

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
    const result = JSON.parse(await fs.readFile(contactsPath, 'utf-8'));
    const contacts = result.filter((c) => c.id !== contactId);
    const write = await fs.writeFile(
      contactsPath,
      JSON.stringify(contacts),
      'utf-8'
    );
    console.log(contacts, write);
    return contacts;
  } catch (e) {
    console.log(e);
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone } = body;
    console.log(name, email, phone);
    if (name && email && phone) {
      const result = JSON.parse(await fs.readFile(contactsPath, 'utf-8'));
      const newContact = { id: Date.now().toString(), name, email, phone };
      result.push(newContact);
      await fs.writeFile(contactsPath, JSON.stringify(result), 'utf-8');
      console.log(JSON.stringify(result));
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
      const result = JSON.parse(await fs.readFile(contactsPath, 'utf-8'));
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

        await fs.writeFile(contactsPath, JSON.stringify(result), 'utf-8');

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

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  Contact,
};
