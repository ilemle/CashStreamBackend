declare module 'swagger-jsdoc' {
  import { SwaggerDefinition } from 'swagger-ui-express';

  interface Options {
    definition: SwaggerDefinition;
    apis: string[];
  }

  function swaggerJSDoc(options: Options): any;
  export = swaggerJSDoc;
}

declare module 'swagger-ui-express' {
  import { Request, Response } from 'express';

  interface SwaggerUiOptions {
    explorer?: boolean;
    swaggerOptions?: any;
  }

  interface SwaggerUiSetup {
    serve: any;
    setup: (specs: any, options?: SwaggerUiOptions) => (req: Request, res: Response, next?: any) => void;
  }

  const swaggerUi: SwaggerUiSetup;
  export = swaggerUi;
}
