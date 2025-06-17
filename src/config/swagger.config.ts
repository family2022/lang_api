const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Your API Documentation',
    version: '1.0.0',
    description: 'API documentation for your application',
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'abc123' },
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'Password123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            required: true,
            example: 'user@example.com',
          },
          password: { type: 'string', required: true, example: 'Password123' },
        },
      },
    },
  },
};

export default swaggerDefinition;
