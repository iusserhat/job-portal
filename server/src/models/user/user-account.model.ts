import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// This is the schema for the user_account collection
const UserAccountSchema = new mongoose.Schema(
  {
    user_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserType",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      length: 255,
      index: {
        unique: true,
      },
    },
    password: {
      type: String,
      required: true,
      length: 100,
    },
    date_of_birth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      length: 10,
    },
    is_active: {
      type: Boolean,
      required: false,
    },
    contact_number: {
      type: String,
      required: false,
      length: 15,
    },
    sms_notification_active: {
      type: Boolean,
      required: false,
      default: false,
    },
    email_notification_active: {
      type: Boolean,
      required: false,
      default: false,
    },
    user_image: {
      type: String,
      required: false,
    },
    registration_date: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "user_account",
    timestamps: true,
  }
);

// Set the registration date on save
UserAccountSchema.pre("save", function (next) {
  let user = this;
  if (!user.registration_date) {
    user.registration_date = new Date();
  }
  next();
});

// Password hashing
UserAccountSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

// Password comparison
UserAccountSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

// Generate JWT token
UserAccountSchema.methods.generateJWT = function () {
  // Set the expiration date to 60 days
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  // ID değerlerini string'e çevir
  const userId = this._id.toString();
  const userTypeId = this.user_type_id.toString();

  console.log("JWT token oluşturuluyor:", {
    userId: userId,
    userTypeId: userTypeId
  });

  const payload = {
    id: userId,
    email: this.email,
    userType: userTypeId, // Kullanıcı tipini net olarak belirt
  };

  const jwtSecret = process.env.JWT_SECRET || "jwt_secret";
  return jwt.sign(payload, jwtSecret, {
    expiresIn: parseInt((expirationDate.getTime() / 1000).toString(), 10),
  });
};

const UserAccount = mongoose.model("UserAccount", UserAccountSchema);

export default UserAccount;
