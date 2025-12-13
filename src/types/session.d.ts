import 'express-session';
import { User } from 'generated/prisma/client'; // or your user type

declare module 'express-session' {
  interface SessionData {
    user?: Pick<
      User,
      'id' | 'name' | 'email' | 'role' | 'image' | 'emailVerified'
    >;
  }
}
