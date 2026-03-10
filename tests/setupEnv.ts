// Minimal environment setup that must run before modules are imported
process.env.JWT_SIGN_KEY = process.env.JWT_SIGN_KEY || 'test-sign-key';
process.env.JWT_KEY_ISSUER = process.env.JWT_KEY_ISSUER || 'test-issuer';
process.env.JWT_KEY_AUDIENCE = process.env.JWT_KEY_AUDIENCE || 'test-audience';
process.env.JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || '3600';

import 'reflect-metadata';
