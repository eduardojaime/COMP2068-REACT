import { Model } from 'mongoose';
interface User {
    username: string;
    password: string;
    setPassword: (password: string) => any;
    authenticate: (password: string) => any;
}
interface UserModel extends Model<User> {
    createStrategy: () => any;
    serializeUser: () => any;
    deserializeUser: () => any;
}
declare const User: UserModel;
export default User;
//# sourceMappingURL=user.d.ts.map