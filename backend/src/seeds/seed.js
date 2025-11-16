require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Role = require("../models/Role");
const Group = require("../models/Group");
const userService = require("../services/userService");

const run = async () => {
  try {
    await connectDB();

    // Create roles
    const roleNames = [
      { name: "user.create", description: "Create users" },
      { name: "user.read", description: "Read users" },
      { name: "user.update", description: "Update users" },
      { name: "group.create" },
      { name: "group.read" },
      { name: "group.update" },
      { name: "role.create" },
      { name: "role.read" }
    ];

    const roles = [];
    for (const r of roleNames) {
      let role = await Role.findOne({ name: r.name });
      if (!role) role = await Role.create(r);
      roles.push(role);
    }

    // Create Admin group with all roles
    let adminGroup = await Group.findOne({ name: "Admin" });
    if (!adminGroup) {
      adminGroup = await Group.create({ name: "Admin", roles: roles.map(r => r._id) });
    } else {
      adminGroup.roles = Array.from(new Set([...adminGroup.roles.map(String), ...roles.map(r => String(r._id))]));
      await adminGroup.save();
    }

    // Create admin user
    const adminExists = await mongoose.model("User").findOne({ username: "admin" });
    if (!adminExists) {
      const admin = await userService.createUser({
        username: "admin",
        email: "admin@example.com",
        password: "ChangeMe123!", // change this immediately
        companyId: "default"
      });
      admin.groups = [adminGroup._id];
      await admin.save();
      console.log("Admin user created: admin / ChangeMe123!");
    } else {
      adminExists.groups = Array.from(new Set([...adminExists.groups.map(String), adminGroup._id.toString()]));
      await adminExists.save();
      console.log("Admin user already exists, updated groups.");
    }

    console.log("Seeding done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
