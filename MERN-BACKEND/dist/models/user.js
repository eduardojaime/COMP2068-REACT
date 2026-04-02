// import mongoose and passport-local-mongoose plugin modules
import mongoose, { Schema, Model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
// declare user schema
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minLength: 3
    },
    password: {
        type: String,
        trim: true,
        minLength: 8
    }
});
// inject plm into user schema, this includes the 5 methods defined in the interfaces above
userSchema.plugin(passportLocalMongoose.default);
// create and export user model
const User = mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=user.js.map