import { Session, SessionData } from 'express-session';
import { User } from 'generated/prisma/client';

export type CurrentUserType = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'image' | 'emailVerified'
>;

export type SessionType = Session & Partial<SessionData>;
