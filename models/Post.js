const mongoose = require('mongoose');
const { Schema, model } = mongoose;
    
const PostSchema = new Schema(
  {
  title: {
    type: String,
    required: true,
    index: { unique: true }
  },
  description: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
},
{ timestamps: true }
);

module.exports = model('Post', PostSchema, 'posts');