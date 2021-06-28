import * as express from "express";
import "reflect-metadata";
import * as swagger from "swagger-express-ts";

export class Swagger_Mio {

    static Configura(app: any) {
        app.use('/api-docs/swagger', express.static('swagger'));
        app.use('/api-docs/swagger/assets', express.static('node_modules/swagger-ui-dist'));
        //app.use(bodyParser.json());
        app.use(swagger.express(
            {
                definition: {
                    info: {
                        title: "My api",
                        version: "1.0"
                    },
                    externalDocs: {
                        url: "My url"
                    }
                    // Models can be defined here
                }
            }
        ));
        return app;
    }
}