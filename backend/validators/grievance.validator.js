const Joi = require("joi");
const { objectIdValidation } = require("../utils");

const createGrievanceSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  department_id: Joi.string().length(24).required(),
  description: Joi.string().min(10).max(1000).required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
  attachments: Joi.array().items(Joi.object()),
  status: Joi.string()
    .valid("submitted")
    .default("submitted")
    .custom((value, helpers) => {
      if (value !== "submitted") {
        return helpers.error("any.invalid");
      }
      return value;
    }),
});

const updateFullGrievanceSchema = Joi.object({
  department_id: Joi.string(),
  priority: Joi.string().valid("low", "medium", "high"),
  is_active: Joi.boolean(),
  assigned_to: Joi.string().custom(objectIdValidation).label("assigned_to"),
  prevRank: Joi.string().allow(null).optional(),
  nextRank: Joi.string().allow(null).optional(),
});

const updateAssignedGrievanceSchema = Joi.object({
  assigned_to: Joi.string()
    .custom(objectIdValidation)
    .label("assigned_to")
    .required(),
});

const updateStatusGrievanceSchema = Joi.object({
  status: Joi.string()
    .valid("submitted", "in-progress", "resolved", "dismissed")
    .required(),
  prevRank: Joi.string().allow(null).optional(),
  nextRank: Joi.string().allow(null).optional(),
});

const updateMyGrievanceSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(10).max(1000),
  priority: Joi.string().valid("low", "medium", "high"),
});

const updateGrievanceAttachmentSchema = Joi.object({
  attachments: Joi.array().items(Joi.object()),
  delete_attachments: Joi.array().items(Joi.string()),
});

module.exports = {
  createGrievanceSchema,
  updateFullGrievanceSchema,
  updateAssignedGrievanceSchema,
  updateStatusGrievanceSchema,
  updateGrievanceAttachmentSchema,
  updateMyGrievanceSchema,
};
