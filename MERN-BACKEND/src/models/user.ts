// import mongoose and passport-local-mongoose plugin modules
import mongoose, { Schema, Model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

// define user interface
interface User {
    username: string;
    password: string;
    setPassword: (password: string) => any; // encrypting/hashing the password in the DB
    authenticate: (password: string) => any; // comparing the password in the DB with the one provided by the user during login
}

// define user model
interface UserModel extends Model<User> {
    createStrategy: () => any; // initializes the local strategy for passport authentication
    serializeUser: () => any; // defines how to serialize the user data into the session (storing user ID in the session)
    deserializeUser: () => any; // defines how to deserialize the user data from the session (retrieving user data based on the stored user ID)
}

// declare user schema
const userSchema = new Schema<User>({
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
userSchema.plugin(passportLocalMongoose as any);
// create and export user model
const User= mongoose.model<User, UserModel>('User', userSchema);
export default User;