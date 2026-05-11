import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedError, ValidationError } from './errors.js';

const client = new OAuth2Client();

export type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

export async function verifyGoogleIdToken(
  idToken: string,
  audience: string
): Promise<GoogleIdTokenPayload> {
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken, audience });
  } catch {
    throw new UnauthorizedError('Invalid Google token');
  }
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new ValidationError('Google token missing required claims');
  }
  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: Boolean(payload.email_verified),
    name: payload.name ?? undefined,
    picture: payload.picture ?? undefined,
  };
}
