const mongoose = require('mongoose');
const { Schema } = mongoose;
    
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

module.exports = mongoose.model('Post', PostSchema, 'posts');