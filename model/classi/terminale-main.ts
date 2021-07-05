import { IRaccoltaPercorsi, targetTerminale } from "../tools";

import express from "express";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { SalvaListaClasseMetaData } from "./terminale-classe";

import * as http from 'http';
import { ListaTerminaleTest } from "../liste/lista-terminale-test";

import swaggerUI from "swagger-ui-express";

/**
 * 
 */
export function mpMain(path: string) {
    return function (ctr: FunctionConstructor) {
        //tmp.PrintMenu();
        (<any>ctr.prototype).serverExpressDecorato = express();
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
    listaTerminaleTest: ListaTerminaleTest;
    httpServer: any;

    constructor(path: string, server?: express.Express) {
        this.path = path;
        this.percorsi = { pathGlobal: "", patheader: "", porta: 0 };
        if (server == undefined) this.serverExpressDecorato = express();
        else this.serverExpressDecorato = server;
        this.listaTerminaleClassi = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        this.listaTerminaleTest = Reflect.getMetadata(ListaTerminaleTest.nomeMetadataKeyTarget, targetTerminale);
    }

    Inizializza(patheader: string, porta: number, rottaBase: boolean, creaFile?: boolean) {
        const tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);

        if (tmp.length > 0) {
            this.percorsi.patheader = patheader;
            this.percorsi.porta = porta;
            const pathGlobal = '/' + this.path;
            this.percorsi.pathGlobal = pathGlobal;

            //this.serverExpressDecorato.use(urlencoded({ 'extended': true })); // parse application/x-www-form-urlencoded
            //this.serverExpressDecorato.use(bodyParser.urlencoded());
            (<any>this.serverExpressDecorato).use(express.json());
            /* this.serverExpressDecorato.use(express.urlencoded({
                extended: true
            })); */
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

    async StartTestAPI() {
        for (let index2 = 0; index2 < this.listaTerminaleClassi.length; index2++) {
            const tmpClasse = this.listaTerminaleClassi[index2];
            console.log('Classe :' + tmpClasse);
            for (let index = 0; index < tmpClasse.listaMetodi.length; index++) {
                const tmpMetodo = tmpClasse.listaMetodi[index];
                if (tmpMetodo.listaTest) {
                    for (let index = 0; index < tmpMetodo.listaTest.length; index++) {
                        const element = tmpMetodo.listaTest[index];
                        if (tmpMetodo.tipoInterazione == 'rotta' || tmpMetodo.tipoInterazione == 'ambo') {
                            const risposta = await tmpMetodo.ChiamaLaRottaConParametri(
                                element.body, element.query, element.header
                            );
                            if (risposta == undefined) {
                                console.log("Risposta undefined!");
                            } else {
                                console.log(risposta)
                            }
                        }
                    }
                }
            }
        }

    }

    StartHttpServer() {
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

    async StartTest() {
        if (this.listaTerminaleTest) {
            for (let index = 0; index < this.listaTerminaleTest.length; index++) {
                const test = this.listaTerminaleTest[index];
                if (test.listaTest) {
                    console.log("Inizio lista test con nome : " + test.listaTest.nome);
                    for (let index2 = 0; index2 < test.listaTest.testUnita.length; index2++) {
                        const element = test.listaTest.testUnita[index2];
                        let risultato;
                        try {
                            console.log("Inizio test con nome : " + element.nome);
                            if (element) {
                                if (element.FunzioniCreaAmbienteEsecuzione) {
                                    risultato = await element.FunzioniCreaAmbienteEsecuzione();
                                }
                                if (element.FunzioniDaTestare) {
                                    risultato = await element.FunzioniDaTestare();
                                }
                                if (element.FunzioniDiPulizia) {
                                    risultato = await element.FunzioniDiPulizia();
                                }
                            }
                            console.log("Fine test con nome : " + element.nome);
                            if (risultato) {
                                if (risultato.passato) {
                                    console.log("TEST PASSATO.");
                                }
                                else {
                                    console.log("TEST NON PASSATO.");
                                }
                            } else {
                                console.log("TEST NESSUN RISULTATO.");
                            }
                        } catch (error) {
                            console.log(error);
                            console.log("TEST IN ERRORE.");
                        }
                    }
                    console.log("Fine lista test con nome : " + test.listaTest.nome);
                }
            }
        }
    }

    /* InizializzaHandlebars() {
        //  this.serverExpressDecorato.engine('handlebars', exphbs());
        // this.serverExpressDecorato.set('view engine', 'handlebars'); 
        ///////////////////////////////////////////////////////////////////////////////////////
        // Configure template Engine and Main Template File
        this.serverExpressDecorato.engine('hbs', exphbs({
            defaultLayout: 'main',
            extname: '.hbs'
        }));
        // Setting template Engine
        this.serverExpressDecorato.set('view engine', 'hbs');

        // routes
        this.serverExpressDecorato.get('/', (req, res) => {
            res.render('home', { msg: 'This is home page' });
        });
        this.serverExpressDecorato.get('/about-us', (req, res) => {
            res.render('about-us');
        });
    } */

    InizializzaSwagger() {
        try {

            let swaggerClassePath = '';
            for (let index = 0; index < this.listaTerminaleClassi.length; index++) {
                const element = this.listaTerminaleClassi[index];
                const tmp = element.SettaSwagger();
                if (index > 0 && tmp != undefined && tmp != undefined && tmp != '')
                    swaggerClassePath = swaggerClassePath + ', ';
                if (tmp != undefined && tmp != undefined && tmp != '')
                    swaggerClassePath = swaggerClassePath + tmp;
            }
            const ritorno = ` {
            "openapi": "3.0.0",
            "servers": [
                {
                    "url": "https://staisicuro.medicaltech.it/",
                    "variables": {},
                    "description": "indirizzo principale"
                },
                {
                    "url": "http://ss-test.medicaltech.it/",
                    "description": "indirizzo secondario nel caso quello principale non dovesse funzionare."
                }
            ],
            "info": {
                "description": "Documentazione delle API con le quali interrogare il server dell'applicazione STAI sicuro, per il momento qui troverai solo le api con le quali interfacciarti alla parte relativa al paziente.Se vi sono problemi sollevare degli issues o problemi sulla pagina di github oppure scrivere direttamente una email.",
                "version": "1.0.0",
                "title": "STAI sicuro",
                "termsOfService": "https://github.com/MedicaltechTM/STAI_sicuro"
            },
            "tags": [],
            "paths": {
                ${swaggerClassePath}
            },
            "externalDocs": {
                "description": "Per il momento non vi sono documentazione esterne.",
                "url": "-"
            },
            "components": {
                "schemas": {},
                "securitySchemes": {},
                "links": {},
                "callbacks": {}                
            },
            "security": []
        }`;
            /* 
            ritorno = ritorno.replace('\n', '');
            ritorno = ritorno.replace(',\n', ',');
            ritorno = ritorno.replace('},\n', '},');
            ritorno = ritorno.replace('{},\n', '{},');
            ritorno = ritorno.replace('}\n', '}');
            ritorno = ritorno.replace('{\n', '{');
            ritorno = ritorno.replace(']\n', ']');
            ritorno = ritorno.replace('[\n', '[');
            ritorno = ritorno.replace('"\n', '"'); 
            const json = JSON.parse(ritorno); 
            */
            console.log(ritorno);
            this.serverExpressDecorato.use("/api-docs", swaggerUI.serve, swaggerUI.setup(JSON.parse(ritorno)));
            return ritorno;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    /************************************** */


    async PrintMenu() {
        const tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        //console.log("Menu main, digita il numero della la tua scelta: ");
        await tmp.PrintMenuClassi();

    }
}
