import * as express from "express";
import "reflect-metadata";
import swagger from "swagger-express-ts";

export class Swagger_Mio {

    /**
     * 
     * @param app 
     * @param path : '/api-docs/swagger'
     * @param pathAssets : '/api-docs/swagger/assets'
     * @param titolo : "My api"
     * @param versione : "1.0"
     * @returns 
     */
    static Configura(app: any, path: string, pathAssets: string, titolo: string, versione: string) {
        app.use(path, express.static('swagger'));
        app.use(pathAssets, express.static('node_modules/swagger-ui-dist'));
        //app.use(bodyParser.json());
        app.use(swagger.express(
            {
                definition: {
                    info: {
                        title: titolo,
                        version: versione
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