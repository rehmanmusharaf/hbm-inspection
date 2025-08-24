const mongoose = require('mongoose');
const User = require('../models/User.model');
require('dotenv').config();

const createAdditionalUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        name: 'Inspector John',
        email: 'inspector@example.com',
        password: 'password123',
        role: 'inspector',
        isEmailVerified: true,
        isActive: true
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\nAvailable test accounts:');
    console.log('------------------------');
    console.log('Admin: admin@example.com / password123');
    console.log('Inspector: inspector@example.com / password123');
    console.log('User: user@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createAdditionalUsers();