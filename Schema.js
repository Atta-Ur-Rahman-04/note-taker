// validation schema for Notes body
const Joi = require("joi");

const notesSchema = Joi.object({
  Notes: Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required().max(200),
    content: Joi.string().required().max(7000),
  }).required(),
});

module.exports = { notesSchema };
// this validation is for notes creation body that what if the body is empty or the body doesnt have the required data
