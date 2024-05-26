import Joi, { ObjectSchema } from 'joi';

// Base schema keys
const baseKeys = {
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, '')
};

const postSchema: ObjectSchema = Joi.object().keys(baseKeys);

const postWithImageSchema: ObjectSchema = postSchema.keys({
  image: Joi.string().required().messages({
    'any.required': 'Image is a required field',
    'string.empty': 'Image property is not allowed to be empty'
  })
});

const postWithVideoSchema: ObjectSchema = postSchema.keys({
  video: Joi.string().required().messages({
    'any.required': 'Video is required',
    'string.empty': 'Video property is not allowed to be empty'
  })
});

export { postSchema, postWithImageSchema, postWithVideoSchema };
