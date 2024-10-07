const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    phone: {  // Số điện thoại
        type: String,
        required: true,
        unique: true
    },
    createdAt: {  // Ngày tạo tài khoản
        type: Date,
        default: Date.now
    },
    dateOfBirth: {  // Ngày sinh
        type: Date,
        required: true  // Đảm bảo trường này là bắt buộc
    },
    address: {  // Địa chỉ
        type: String,
        required: true  // Đảm bảo trường này là bắt buộc
    }
});

// Change model name to "User" (capitalized)
const User = mongoose.model("User", userSchema);

module.exports = User;
