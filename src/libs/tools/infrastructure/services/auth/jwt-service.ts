import jwt from 'jsonwebtoken';

import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {JwtServiceInterface} from '../../../domain/services/auth';
import {getEnvironmentVariables, isObject, isString} from '../../utils';

const jwtServiceCreator = (): JwtServiceInterface => {
  const [JWT_SIGN_KEY, JWT_KEY_ISSUER, JWT_KEY_AUDIENCE, JWT_EXPIRATION_TIME] = getEnvironmentVariables([
    'JWT_SIGN_KEY',
    'JWT_KEY_ISSUER',
    'JWT_KEY_AUDIENCE',
    'JWT_EXPIRATION_TIME',
  ]);

  const JWT_EXPIRATION_TIME_NUMBER = parseInt(JWT_EXPIRATION_TIME, 10);

  return {
    getPayload: (token: string) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SIGN_KEY!, {
          issuer: process.env.JWT_KEY_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }) as unknown;

        if (
          isObject(payload) &&
          isString(payload.id) &&
          isString(payload.email) &&
          isString(payload.role) &&
          isString(payload.name)
        ) {
          return {
            id: payload.id,
            email: payload.email,
            role: payload.role as UserRole,
            name: payload.name,
          };
        }

        return null;
      } catch {
        return null;
      }
    },
    getSignedJwtTokenResponse: payload => {
      const signedToken = jwt.sign(
        {
          ...payload,
        },
        JWT_SIGN_KEY,
        {
          issuer: JWT_KEY_ISSUER,
          audience: JWT_KEY_AUDIENCE,
          expiresIn: JWT_EXPIRATION_TIME_NUMBER,
        }
      );
      return {
        access_token: signedToken,
        expires_in: JWT_EXPIRATION_TIME_NUMBER,
      };
    },
  };
};

export {jwtServiceCreator};
