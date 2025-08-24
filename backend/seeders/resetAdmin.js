const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
require("dotenv").config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://goffood:gofood@cluster0.qlkoag7.mongodb.net/hbm-inspection?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("Connected to MongoDB");

    // Delete existing admin
    const deleted = await User.deleteOne({ email: "admin@hbminspection.com" });
    if (deleted.deletedCount > 0) {
      console.log("Existing admin user deleted");
    }

    // Create new admin user with properly hashed password
    const adminUser = new User({
      name: "System Administrator",
      email: "admin@hbminspection.com",
      password: "Admin@123456", // Will be hashed by the pre-save hook
      role: "admin",
      phone: "03001234567",
      isEmailVerified: true,
      isActive: true,
      address: {
        street: "Main Office",
        city: "Karachi",
        state: "Sindh",
        zipCode: "74000",
        country: "Pakistan",
      },
    });

    // Save the user - this will trigger the password hashing
    await adminUser.save();

    console.log("Admin user created successfully!");
    console.log("----------------------------------------");
    console.log("Admin Credentials:");
    console.log("Email: admin@hbminspection.com");
    console.log("Password: Admin@123456");
    console.log("----------------------------------------");
    console.log("You can now login with these credentials");

    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin:", error);
    process.exit(1);
  }
};

// Run the seeder
resetAdmin();