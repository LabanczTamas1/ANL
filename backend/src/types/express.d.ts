declare global {
  namespace Express {
    interface User {
      id: string;
      sub?: string;
      email: string;
      username?: string;
      role: string;
      firstName?: string;
      lastName?: string;
      accessToken?: string;
      refreshToken?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
      calendarState?: any;
      correlationId?: string;
    }
  }
}

export {};
