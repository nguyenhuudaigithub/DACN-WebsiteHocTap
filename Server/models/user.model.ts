require('dotenv').config();
import mongoose,{Document,Model,Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar:{
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Vui long nhap ten !"],
    },
    email: {
        type: String,
        required: [true, "Vui lòng nhập email!"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Vui lòng nhập đúng email!",
        },
        unique: true,
    },
    password:{
        type: String,
        require: [true,"Vui lòng nhập mật khẩu !"],
        minlength: [6,"Độ dài tổi thiểu của mật khẩu là 6 ký tự"],
        select: false,
    },
    avatar:{
        public_id: String,
        url: String,
    },
    role:{
        type: String,
        default:"user",
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    courses:[
        {
            courseId: String,         
        }
    ],
},{timestamps:true});

// Băm mật khẩu trước khi lưu
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// token đăng nhập
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '');
}
// refresh
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '');
}

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password); 
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;