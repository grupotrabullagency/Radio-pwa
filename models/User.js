const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['admin', 'dj', 'user'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        autoplay: {
            type: Boolean,
            default: true
        }
    },
    lastLogin: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
    return {
        id: this._id,
        username: this.username,
        name: this.name,
        email: this.email,
        isAdmin: this.isAdmin,
        role: this.role,
        avatar: this.avatar,
        preferences: this.preferences,
        lastLogin: this.lastLogin,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
});

module.exports = mongoose.model('User', userSchema);