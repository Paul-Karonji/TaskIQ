// NextAuth authentication helper for API routes

import { auth } from '@/auth';

export async function getServerSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}
