const fs = require('fs/promises')
const path = require('path');
const contactsPath = path.join(__dirname, 'contacts.json');
const listContacts = async () => {
  try{
      const result = await fs.readFile(contactsPath, "utf-8")
      // console.log(result);
      return result
  }
  catch(e){
    console.log(e);
  }
}

const getContactById = async (contactId) => {
  try{
    const result = JSON.parse(await fs.readFile(contactsPath, "utf-8"))
    const contact = result.filter((c) => c.id === contactId)
    console.log(contactId);
    console.log(contact);
    return contact
  } 
  catch(e){
    console.log(e);
  }
}

const removeContact = async (contactId) => {
  try{
    const result = JSON.parse(await fs.readFile(contactsPath, "utf-8"))
    const contacts = result.filter((c) => c.id !== contactId)
    const write = await fs.writeFile(contactsPath, JSON.stringify(contacts), "utf-8")
    console.log(contacts,write);
    return contacts
  } catch(e){
    console.log(e);
  }
}

const addContact = async (body) => {}

const updateContact = async (contactId, body) => {}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
