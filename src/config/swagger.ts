import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = { 
    definition: {
        openapi: '3.0.0',
        info: {
          title: 'MERN Stack API Documentation',
          version: '1.0.0',
          description: 'API documentation for mern stack application',
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT}`,
            description: 'Development server',
          },
        ],
      },
      apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}