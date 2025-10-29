/**
 * Script to create a new admin user
 * Usage: npx tsx src/scripts/createAdmin.ts
 */

import { connectDatabase } from '../config/database.js';
import AdminModel from '../models/Admin.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log('\n🔐 Create Admin User\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Connect to database
    await connectDatabase();

    // Get admin details
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 characters): ');
    const roleInput = await question('Role (admin/moderator/editor) [editor]: ');
    const role = roleInput || 'editor';

    // Validate input
    if (!username || !email || !password) {
      console.error('\n❌ Username, email, and password are required');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Password must be at least 8 characters');
      process.exit(1);
    }

    if (!['admin', 'moderator', 'editor'].includes(role)) {
      console.error('\n❌ Invalid role. Must be admin, moderator, or editor');
      process.exit(1);
    }

    // Check if username or email already exists
    const existingAdmin = await AdminModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      console.error('\n❌ Username or email already exists');
      process.exit(1);
    }

    // Set permissions based on role
    let permissions;
    if (role === 'admin') {
      permissions = {
        canManageBooks: true,
        canManageNashids: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageAdmins: true
      };
    } else if (role === 'moderator') {
      permissions = {
        canManageBooks: true,
        canManageNashids: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageAdmins: false
      };
    } else {
      permissions = {
        canManageBooks: true,
        canManageNashids: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canManageAdmins: false
      };
    }

    // Create admin
    const admin = new AdminModel({
      username,
      email,
      password,
      role,
      permissions,
      isActive: true
    });

    await admin.save();

    console.log('\n✅ Admin created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Details:');
    console.log(`  ID: ${admin._id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Permissions:`);
    console.log(`    - Manage Books: ${permissions.canManageBooks}`);
    console.log(`    - Manage Nashids: ${permissions.canManageNashids}`);
    console.log(`    - Manage Users: ${permissions.canManageUsers}`);
    console.log(`    - View Analytics: ${permissions.canViewAnalytics}`);
    console.log(`    - Manage Admins: ${permissions.canManageAdmins}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('You can now login at: POST /api/admin/login');
    console.log('With credentials:');
    console.log(`  username: ${username}`);
    console.log(`  password: [your password]\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
    process.exit(1);
  }
}

// Run the script
createAdmin();
