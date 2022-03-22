const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const CustomerSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
},
{ timestamps: true }
);

// use mongoose's middleware to hash password before save
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

CustomerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

module.exports = model('Customer', CustomerSchema, 'customers');
