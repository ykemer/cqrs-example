import {Router} from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'This is a simple CRUD API application made with Express and documented with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserUpdateRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: "User's name",
            },
            password: {
              type: 'string',
              format: 'password',
              description: "User's password (4-20 characters)",
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              description: "User's role",
            },
          },
        },
        UserRegisterRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: "User's name",
            },
            password: {
              type: 'string',
              format: 'password',
              description: "User's password (4-20 characters)",
            },
            email: {
              type: 'string',
              format: 'email',
              description: "User's email",
            },
          },
        },
        UserLoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: "User's email",
            },
            password: {
              type: 'string',
              format: 'password',
              description: "User's password (4-20 characters)",
            },
          },
        },

        UserTokenResponse: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'JWT token',
            },
            expires_in: {
              type: 'number',
              description: 'Token expiration time in seconds',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {type: 'string', format: 'uuid'},
            name: {type: 'string'},
            email: {type: 'string', format: 'email'},
            role: {type: 'string', enum: ['user', 'admin']},
          },
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserResponse',
              },
            },
            page: {type: 'number'},
            pageSize: {type: 'number'},
            total: {type: 'number'},
            hasNextPage: {type: 'boolean'},
          },
        },
        CryptoDataResponse: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Cryptocurrency name',
            },
            price_usd: {
              type: 'number',
              description: 'Price in USD',
            },
          },
        },
        IntegratedDataResponse: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'City name',
            },
            temperature: {
              type: 'string',
              description: 'Temperature information',
            },
            weather: {
              type: 'string',
              description: 'Weather condition',
            },
            crypto: {
              $ref: '#/components/schemas/CryptoDataResponse',
            },
          },
        },
      },
    },
  },
  apis: ['./**/infrastructure/routers/*.ts'],
};

const specs = swaggerJsdoc(options);

const router = Router();

const uiOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

router.use('/', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));

export {router as swaggerRouter};
