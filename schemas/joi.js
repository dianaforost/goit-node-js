const Joi = require('joi');

const contactPostSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});
const contactPutSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
});
const contactPatchSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
const userSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
});
module.exports = {
  contactPostSchema,
  contactPutSchema,
  contactPatchSchema,
  userSchema,
};
