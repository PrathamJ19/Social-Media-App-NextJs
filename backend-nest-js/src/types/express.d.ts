// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: { id: string }; // Or whatever properties are part of the user object
  }
}
