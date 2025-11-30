// seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@company.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password (if pre-save hook doesn't handle it)
    // const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      position: "Administrator",
      verified: true,
    });

    console.log("✅ Admin user created successfully:", admin.email);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin user:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
