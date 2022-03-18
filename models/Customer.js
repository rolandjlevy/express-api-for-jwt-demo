const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const CustomerSchema = new Schema(
  {
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
CustomerSchema.pre('save', async (next) => {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

CustomerSchema.methods.comparePassword = (password, callback) => {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('Customer', CustomerSchema, 'customers');
