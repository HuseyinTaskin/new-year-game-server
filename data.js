const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      default: 0
    },
    click1: {
      type: Number,
      required: true,
      default: 0
    },
    click2: {
      type: Number,
      required: true,
      default: 0
    },
    click3: {
      type: Number,
      required: true,
      default: 0
    },
    click4: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

AccountSchema.index({ userName: 1 });
module.exports = mongoose.model("devaccount", AccountSchema);
