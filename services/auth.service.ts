import { UserRepository } from '../repositories/user.repository.js';
import * as bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt.js';
import { Role } from '@prisma/client';

const userRepository = new UserRepository();

export class AuthService {
  async register(data: any) {
    const { name, email, password } = data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: Role.TEAM_MEMBER, // default role
    });

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async demoLogin(role: string) {
    let email = '';
    switch (role.toUpperCase()) {
      case 'ADMIN':
        email = 'admin@demo.com';
        break;
      case 'PROJECT_MANAGER':
        email = 'pm@demo.com';
        break;
      case 'TEAM_MEMBER':
        email = 'member@demo.com';
        break;
      default:
        throw new Error('Invalid demo role');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error(`Demo account for ${role} not found. Ensure seed script has run.`);
    }

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Since findById returns selection without password, we can cast it or fetch user directly
    const fullUser = await userRepository.findByEmail(user.email);
    if (!fullUser) {
      throw new Error('User not found');
    }

    const payload: TokenPayload = {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      name: fullUser.name,
    };

    const accessToken = generateAccessToken(payload);
    return { accessToken };
  }
}
