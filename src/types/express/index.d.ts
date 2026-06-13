declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
    interface User {
      token?: string;
    }
  }
}

export {};