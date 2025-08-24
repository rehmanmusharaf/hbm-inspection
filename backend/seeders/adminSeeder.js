const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://goffood:gofood@cluster0.qlkoag7.mongodb.net/hbm-inspection?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@hbminspection.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin@123456", 10);

    const adminUser = new User({
      name: "System Administrator",
      email: "admin@hbminspection.com",
      password: hashedPassword,
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

    await adminUser.save();

    console.log("Admin user created successfully!");
    console.log("----------------------------------------");
    console.log("Admin Credentials:");
    console.log("Email: admin@hbminspection.com");
    console.log("Password: Admin@123456");
    console.log("----------------------------------------");
    console.log("Please change the password after first login");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
