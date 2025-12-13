// src/lib/session.service.ts
import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/browser';
import { redisClient } from 'src/lib/redis';

interface SessionData {
  user?: Pick<
    User,
    'id' | 'name' | 'email' | 'role' | 'image' | 'emailVerified'
  >;
  [key: string]: any;
}

@Injectable()
export class SessionProvider {
  /**
   * Révoque toutes les sessions d'un utilisateur sauf la session actuelle
   * @param userId - ID de l'utilisateur
   * @param currentSessionId - ID de la session actuelle à préserver
   */
  async revokeAllUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    const pattern = 'session:*';
    let cursor = '0'; // STRING, pas number
    let revokedCount = 0;

    do {
      // Scanner les clés Redis par batch
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor; // result.cursor est déjà un string
      const keys = result.keys;

      // Vérifier chaque session
      for (const key of keys) {
        const sessionData = await redisClient.get(key);
        if (!sessionData) continue;

        try {
          const session = JSON.parse(sessionData) as SessionData;
          const sessionId = key.replace('session:', '');

          // Si la session appartient à l'utilisateur ET n'est pas la session actuelle
          if (
            typeof session.user?.id === 'string' &&
            session.user.id === userId &&
            sessionId !== currentSessionId
          ) {
            await redisClient.del(key);
            revokedCount++;
          }
        } catch (error) {
          console.error(`Erreur lors du parsing de la session ${key}:`, error);
        }
      }
    } while (cursor !== '0'); // Comparer avec '0' (string)

    return revokedCount;
  }

  /**
   * Révoque une session spécifique
   * @param sessionId - ID de la session à révoquer
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    const result = await redisClient.del(`session:${sessionId}`);
    return result > 0;
  }

  /**
   * Compte le nombre de sessions actives pour un utilisateur
   * @param userId - ID de l'utilisateur
   */
  async countUserSessions(userId: number): Promise<number> {
    const pattern = 'session:*';
    let cursor = '0'; // STRING, pas number
    let count = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor; // result.cursor est déjà un string
      const keys = result.keys;

      for (const key of keys) {
        const sessionData = await redisClient.get(key);
        if (!sessionData) continue;

        try {
          const session = JSON.parse(sessionData) as SessionData;
          if (session.userId === userId) {
            count++;
          }
        } catch (error) {
          console.error(`Erreur lors du parsing de la session ${key}:`, error);
        }
      }
    } while (cursor !== '0'); // Comparer avec '0' (string)

    return count;
  }
}
