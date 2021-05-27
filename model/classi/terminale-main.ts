import { InizializzaLogbaseIn, InizializzaLogbaseOut, IPrintabile, IRaccoltaPercorsi, targetTerminale } from "../tools";

import express from "express";
import { Request, Response } from "express";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { urlencoded, json as BodyParseJson } from 'body-parser';
import { SalvaListaClasseMetaData, TerminaleClasse } from "./terminale-classe";
//const swaggerUI = require('swagger-ui-express');
import fs from "fs";

/**
 * 
 */
export function mpMain(path: string) {
    return function (ctr: Function) {
        //tmp.PrintMenu();
        ctr.prototype.serverExpressDecorato = express();
        /* ctr.prototype.Inizializza = () => {
            let tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
            for (let index = 0; index < tmp.length; index++) {
                const element = tmp[index];
                element.SettaPathRoot_e_Global(path, '/' + path + '/' + element.path);
                ctr.prototype.serverExpressDecorato.use('/' + path + '/' + element.path, element.rotte);
            }
        }
        ctr.prototype.PrintMenu = () => {
            let tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
            console.log("mpMain" + ' -> ' + 'PrintMenu');
            tmp.PrintMenu();
        }; */
    }
}
export class Main {
    percorsi: IRaccoltaPercorsi;
    path: string;
    serverExpressDecorato: express.Express;
    listaTerminaleClassi: ListaTerminaleClasse;

    constructor(path: string, server?: express.Express) {
        this.path = path;
        this.percorsi = { pathGlobal: "", patheader: "", porta: 0 };
        if (server == undefined) this.serverExpressDecorato = express();
        else this.serverExpressDecorato = server;
        this.listaTerminaleClassi = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
    }

    Inizializza(patheader: string, porta: number, rottaBase: boolean, creaFile?: boolean) {
        let tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        if (tmp.length > 0) {
            this.percorsi.patheader = patheader;
            this.percorsi.porta = porta;
            const pathGlobal = '/' + this.path;
            this.percorsi.pathGlobal = pathGlobal;

            this.serverExpressDecorato.use(urlencoded({ 'extended': true })); // parse application/x-www-form-urlencoded

            this.serverExpressDecorato.use(BodyParseJson({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

            this.serverExpressDecorato.route
            for (let index = 0; index < tmp.length; index++) {
                const element = tmp[index];
                /* this.serverExpressDecorato.use(bodyParser.json({
                    limit: '50mb',
                    verify(req: any, res, buf, encoding) {
                        req.rawBody = buf;
                    }
                })); */
                element.SettaPathRoot_e_Global(this.path, this.percorsi, this.serverExpressDecorato);

                //this.serverExpressDecorato.use(element.GetPath, element.rotte);
            }

            SalvaListaClasseMetaData(tmp);
        }
        else {
            console.log("Attenzione non vi sono rotte e quantaltro.");
        }
    }

    StartExpress() {
        var httpServer = http.createServer(this.serverExpressDecorato);
        this.serverExpressDecorato.listen(this.percorsi.porta)
        //httpServer.listen(this.percorsi.porta);
        //this.serverExpressDecorato.listen(this.percorsi.porta);
    }
}

import * as http from 'http';