declare global {
  namespace Express {
    interface AdminRequestUser {
      id: string;
      email: string;
      username: string;
      role: string;
      isActive: boolean;
      totpEnabled?: boolean;
      createdAt: Date;
      updatedAt: Date;
    }

    interface Request {
      admin?: AdminRequestUser;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    adminEmail?: string;
    adminRole?: string;
  }
}

export {};
