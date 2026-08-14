const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// we plugin the passportLocalMongoose cause it bydefault implement the given properities username,hashing,salting,password and also authenticate and other methods
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
