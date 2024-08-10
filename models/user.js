import mongoose, { model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image : {type : String, required : true},
  places : {type : String, required : true}
});

userSchema.plugin(uniqueValidator);

export const userModel = mongoose.model("User", userSchema);