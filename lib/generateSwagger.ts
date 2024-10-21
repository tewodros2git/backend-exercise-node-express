import { getDMMF } from '@prisma/sdk';
import swaggerJsDoc from 'swagger-jsdoc';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API',
      description: 'Express API Information',
      version: '1.0.0',
      contact: {
        name: 'Amazing Developer'
      },
      servers: ['http://localhost:3000']
    }
  },
  apis: ['./src/index.ts', './src/api/*.ts']
};


const PRISMA_TO_OPENAPI_PRIMITIVE_TYPE: { [key: string]: string } = {
  "Int": "number",
  "DateTime": "string"
}

async function generateSwaggerDefinitions() {
  // Read the Prisma schema file
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

  // Get DMMF from Prisma schema
  const datamodel = await getDMMF({ datamodel: schema });

  let definitions: any = {};

  datamodel.datamodel.models.forEach(model => {
    let properties: any = {};
    model.fields.forEach(field => {
      const fieldType = PRISMA_TO_OPENAPI_PRIMITIVE_TYPE[field.type] || field.type.toLowerCase();
      properties[field.name] = {
        type: fieldType
      };
    });

    definitions[model.name] = {
      type: 'object',
      properties
    };
  });

  const swaggerDocs: any = swaggerJsDoc(swaggerOptions);
  swaggerDocs.components = { schemas: definitions };

  fs.writeFileSync('./src/swagger-output.json', JSON.stringify(swaggerDocs, null, 2));
  console.log('Swagger documentation generated successfully!');
}

generateSwaggerDefinitions().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());