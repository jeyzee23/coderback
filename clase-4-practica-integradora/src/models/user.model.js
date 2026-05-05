import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';

const collection = () => getDB().collection('users');

const toId = (id) => {
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch {
    return null;
  }
};

const normalize = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

export const UserModel = {
  findByEmail: async (email) => {
    const user = await collection().findOne({ email });
    return normalize(user);
  },

  findById: async (id) => {
    const _id = toId(id);
    if (!_id) return null;
    const user = await collection().findOne({ _id });
    return normalize(user);
  },

  create: async ({ first_name, last_name, email, age, password, role = 'user' }) => {
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      first_name,
      last_name,
      email,
      age,
      password: hashed,
      role,
      createdAt: new Date(),
    };
    const { insertedId } = await collection().insertOne(user);
    return { id: insertedId.toString(), ...user };
  },

  verifyPassword: async (plain, hashed) => bcrypt.compare(plain, hashed),

  list: async () => {
    const users = await collection().find({}, { projection: { password: 0 } }).toArray();
    return users.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  },

  updateLastConnection: async (id) => {
    const _id = toId(id);
    if (!_id) return null;
    await collection().updateOne(
      { _id },
      { $set: { lastConnection: new Date() } }
    );
  },

  update: async (id, data) => {
    const _id = toId(id);
    if (!_id) return null;
    await collection().updateOne({ _id }, { $set: data });
    return UserModel.findById(id);
  },

  delete: async (id) => {
    const _id = toId(id);
    if (!_id) return null;
    await collection().deleteOne({ _id });
  },
};