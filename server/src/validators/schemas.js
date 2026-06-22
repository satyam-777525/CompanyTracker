import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    avatar: Joi.string().uri().allow(''),
    isPublicProfile: Joi.boolean(),
  }),
};

export const companySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    website: Joi.string().uri().allow(''),
    logo: Joi.string().uri().allow(''),
    tags: Joi.array().items(Joi.string()),
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow(''),
    website: Joi.string().uri().allow(''),
    logo: Joi.string().uri().allow(''),
    tags: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  }),
};

export const questionSchemas = {
  create: Joi.object({
    questionNumber: Joi.number().integer().min(1).required(),
    title: Joi.string().min(1).max(200).required(),
    url: Joi.string().uri().required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
    acceptanceRate: Joi.number().min(0).max(100).default(0),
    frequencyRate: Joi.number().min(0).max(100).default(0),
    company: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    curatedLists: Joi.array().items(Joi.string().valid('blind_75', 'neetcode_150')),
  }),
  update: Joi.object({
    questionNumber: Joi.number().integer().min(1),
    title: Joi.string().min(1).max(200),
    url: Joi.string().uri(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
    acceptanceRate: Joi.number().min(0).max(100),
    frequencyRate: Joi.number().min(0).max(100),
    tags: Joi.array().items(Joi.string()),
    curatedLists: Joi.array().items(Joi.string().valid('blind_75', 'neetcode_150')),
    isActive: Joi.boolean(),
  }),
};

export const progressSchemas = {
  update: Joi.object({
    status: Joi.string().valid('not_started', 'solved', 'revision'),
    isBookmarked: Joi.boolean(),
    isRevision: Joi.boolean(),
  }),
};

export const noteSchemas = {
  upsert: Joi.object({
    content: Joi.string().allow('').required(),
  }),
};
