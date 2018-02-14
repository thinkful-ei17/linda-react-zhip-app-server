'use strict';

const mongoose = require('mongoose');

//this is our schema to represent an item
const transactionSchema = new mongoose.Schema({
  userIdInitiator: {type: String, default: null, required: true},
  userIdClaimer: {type: String, default: null},
  transactionAmount: {type: Number, default: 0, required: true},
  isIOUClaimed: {type: Boolean, default: false}
});


const userSchema = new mongoose.Schema({
  accountBalance: {type: Number, default: 1000},
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
// this can also be used to expose the generated id
transactionSchema.methods.serialize = function() {
  return {
    id: this._id,
    transactionAmount: this.transactionAmount,
  };
};

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    accountBalance: this.accountBalance
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Transaction, User};
