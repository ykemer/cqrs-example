import {Router} from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

import {apiReference} from '@scalar/express-api-reference';

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
        ProblemDetails: {
          type: 'object',
          properties: {
            type: {type: 'string', format: 'uri', description: 'URI reference identifying the problem type'},
            title: {type: 'string', description: 'Short human-readable summary of the problem'},
            status: {type: 'integer', description: 'HTTP status code'},
            detail: {type: 'string', description: 'Human-readable explanation of the problem'},
            traceId: {type: 'string', description: 'Trace identifier for correlating logs'},
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {type: 'string'},
                  field: {type: 'string'},
                },
              },
            },
          },
        },
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
        CourseResponse: {
          type: 'object',
          properties: {
            id: {type: 'string', format: 'uuid'},
            name: {type: 'string'},
            description: {type: 'string'},
            enrolledUsers: {type: 'number', description: 'Number of enrolled users'},
          },
        },
        CoursesListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {$ref: '#/components/schemas/CourseResponse'},
            },
            page: {type: 'number'},
            pageSize: {type: 'number'},
            total: {type: 'number'},
            hasNextPage: {type: 'boolean'},
          },
        },
        ClassResponse: {
          type: 'object',
          properties: {
            id: {type: 'string', format: 'uuid'},
            courseId: {type: 'string', format: 'uuid'},
            maxUsers: {type: 'number'},
            registrationDeadline: {type: 'string', format: 'date-time'},
            startDate: {type: 'string', format: 'date-time'},
            endDate: {type: 'string', format: 'date-time'},
          },
        },
        ClassesListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {$ref: '#/components/schemas/ClassResponse'},
            },
            total: {type: 'number'},
          },
        },
      },
    },
  },
  apis: ['./src/slices/**/*.ts'],
};

const specs = swaggerJsdoc(options);

const router = Router();

router.get('/openapi.json', (_req, res) => {
  res.json(specs);
});

router.use(
  '/api-docs',
  apiReference({
    spec: {
      content: specs,
    },
    theme: 'purple',
  })
);

export {router as swaggerRouter};
