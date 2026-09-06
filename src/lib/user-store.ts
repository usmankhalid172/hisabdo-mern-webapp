import User from '@/models/User';
import connectDB from '@/lib/db';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  passwordHash: string;
  phone?: string;
  shopName?: string;
  createdAt: string;
}

function serializeUser(user: any): StoredUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    passwordHash: user.passwordHash,
    phone: user.phone || '',
    shopName: user.shopName || '',
    createdAt: new Date(user.createdAt).toISOString(),
  };
}

export const userStore = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    return user ? serializeUser(user) : null;
  },

  async findById(id: string): Promise<StoredUser | null> {
    await connectDB();
    const user = await User.findById(id).lean();
    return user ? serializeUser(user) : null;
  },

  async createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    shopName?: string;
    role?: 'user' | 'admin';
  }): Promise<StoredUser> {
    await connectDB();

    const user = await User.create({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      phone: userData.phone?.trim() || '',
      shopName: userData.shopName?.trim() || `${userData.name}'s Khata Store`,
      role: userData.role || 'user',
    });

    return serializeUser(user);
  },

  async updateUser(id: string, updates: Record<string, unknown>): Promise<StoredUser | null> {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    return user ? serializeUser(user) : null;
  },

  async getAll(): Promise<StoredUser[]> {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return users.map(serializeUser);
  },
};
