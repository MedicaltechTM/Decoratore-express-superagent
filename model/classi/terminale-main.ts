import { InizializzaLogbaseIn, InizializzaLogbaseOut, IPrintabile, IRaccoltaPercorsi, targetTerminale } from "../tools";

import express from "express";
import { Request, Response } from "express";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import bodyParser, { urlencoded, json as BodyParseJson } from 'body-parser';
import { SalvaListaClasseMetaData, TerminaleClasse } from "./terminale-classe";

import * as http from 'http';
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
    httpServer: any;

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

            //this.serverExpressDecorato.use(urlencoded({ 'extended': true })); // parse application/x-www-form-urlencoded
            //this.serverExpressDecorato.use(bodyParser.urlencoded());
            this.serverExpressDecorato.use(express.json());
            //this.serverExpressDecorato.use(BodyParseJson({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

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

            /* this.serverExpressDecorato.use(function (req, res, next) {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

                //intercepts OPTIONS method
                if ('OPTIONS' === req.method) {
                    //respond with 200
                    res.send(200);
                }
                else {
                    //move on
                    next();
                }
            }); */

            this.httpServer = http.createServer(this.serverExpressDecorato);

            SalvaListaClasseMetaData(tmp);
        }
        else {
            console.log("Attenzione non vi sono rotte e quantaltro.");
        }
    }

    StartHttpServer(){
        this.httpServer.listen(this.percorsi.porta);
    }

    StartExpress() {


        /* this.serverExpressDecorato.use(function (req, res) {
            res.send(404);
        });

        this.serverExpressDecorato.all('*', function (req, res) {
            res.redirect('/');
        }); */

        //

        this.serverExpressDecorato.listen(this.percorsi.porta)
    }

    /************************************** */


    async PrintMenu() {
        let tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        //console.log("Menu main, digita il numero della la tua scelta: ");
        await tmp.PrintMenuClassi();

    }
}
