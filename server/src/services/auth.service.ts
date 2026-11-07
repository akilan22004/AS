import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AdminUser } from '@prisma/client';

export class AuthService {
  async findByEmail(email: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, 12);
  }

  async logAction(adminId: string, action: string, resource: string, metadata?: object): Promise<void> {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        resource,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}

export const authService = new AuthService();
