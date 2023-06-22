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

const addContact = async (body) => {
  try{
    const {name, email, phone} = body;
    console.log(name, email, phone);
    if (name && email && phone) {
      const result = JSON.parse(await fs.readFile(contactsPath, "utf-8"))
      const newContact = {id: Date.now().toString(), name, email, phone}
      result.push(newContact)
      const write = fs.writeFile(contactsPath, JSON.stringify(result), "utf-8");
      console.log(JSON.stringify(result), write);
      return { status: 200, result };
    } else{
      return { status: 400, message: "missing required name field" };
    }
  }
  catch(e){
    console.log(e);
  }
}

const updateContact = async (contactId, body) => {}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
