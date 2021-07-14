import { IRaccoltaPercorsi, targetTerminale } from "../tools";

import express from "express";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { SalvaListaClasseMetaData } from "./terminale-classe";

import * as http from 'http';
import { ListaTerminaleTest } from "../liste/lista-terminale-test";

import swaggerUI from "swagger-ui-express";
import { IReturnTest, TerminaleTest } from "./terminale-test";

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

            (<any>this.serverExpressDecorato).use(express.json());

            this.serverExpressDecorato.route
            for (let index = 0; index < tmp.length; index++) {
                const element = tmp[index];
                element.SettaPathRoot_e_Global(this.path, this.percorsi, this.serverExpressDecorato);
            }
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
            this.listaTerminaleTest.sort((x: TerminaleTest, y: TerminaleTest) => {
                if (x.test.numeroRootTest < x.test.numeroRootTest) return -1;
                else if (x.test.numeroRootTest > x.test.numeroRootTest) return 1;
                else {
                    if (x.test.numero < x.test.numero) return -1;
                    else if (x.test.numero > x.test.numero) return 1;
                    else return 0;
                };
            });
            for (let index = 0; index < this.listaTerminaleTest.length; index++) {
                const test = this.listaTerminaleTest[index];
                if (test.test) {
                    console.log("Inizio lista test con nome : " + test.test.nome + ', numero :' + test.test.numero + ' :!:');
                    try {
                        let risultato: IReturnTest | undefined = undefined;
                        if (test.test) {
                            if (test.test.testUnita.FunzioniCreaAmbienteEsecuzione) {
                                risultato = await test.test.testUnita.FunzioniCreaAmbienteEsecuzione();
                            }
                            if (test.test.testUnita.FunzioniDaTestare) {
                                risultato = await test.test.testUnita.FunzioniDaTestare();
                            }
                            if (test.test.testUnita.FunzioniDiPulizia) {
                                risultato = await test.test.testUnita.FunzioniDiPulizia();
                            }
                        }
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
                    console.log("Fine test con nome : " + test.test.nome + ', numero :' + test.test.numero + ' :!:');
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

    InizializzaSwagger(testo?: string) {
        let ritorno = '';
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
            ritorno = ` {
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


            this.serverExpressDecorato.use("/api-docs", swaggerUI.serve, swaggerUI.setup(JSON.parse(ritorno)));

            /* if (testo)
                this.serverExpressDecorato.use("/api-docs-doc", swaggerUI.serve, swaggerUI.setup(JSON.parse(testo)));
 */

            /* const swaggerClassiTesto: {
                numeroElementi: number,
                testo: string,
                nomeClasse: string
            }[] = [];

            for (let index = 0; index < this.listaTerminaleClassi.length; index++) {
                const tmpClasse = this.listaTerminaleClassi[index];
                for (let index2 = 0; index2 < tmpClasse.listaMetodi.length; index2++) {
                    const tmpMetodo = tmpClasse.listaMetodi[index2];
                    if (tmpMetodo.swaggerClassi) {
                        for (let index3 = 0; index3 < tmpMetodo.swaggerClassi.length; index3++) {
                            const classeSwagger = tmpMetodo.swaggerClassi[index3];

                            const tmp = tmpMetodo.SettaSwagger();

                            let inserito = false;

                            for (let indexs4 = 0; indexs4 < swaggerClassiTesto.length; indexs4++) {
                                const element = swaggerClassiTesto[indexs4];
                                if (element.nomeClasse == classeSwagger) {
                                    if (element.numeroElementi > 0 && tmp != undefined && tmp != undefined && tmp != '')
                                        element.testo = element.testo + ', ';
                                    if (tmp != undefined && tmp != undefined && tmp != '')
                                        element.testo = element.testo + tmp;
                                    inserito = true;
                                }
                            }
                            if (tmp && inserito == false)
                                swaggerClassiTesto.push({
                                    nomeClasse: classeSwagger,
                                    numeroElementi: 1,
                                    testo: tmp
                                });
                        }
                    }
                }
            }

            for (let index = 0; index < swaggerClassiTesto.length; index++) {
                const element = swaggerClassiTesto[index];
                const ritorno2 = ` {
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
                        ${element.testo}
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

                this.serverExpressDecorato.use("/api-docs-" + element.nomeClasse, swaggerUI.serve, swaggerUI.setup(JSON.parse(ritorno2)));
            } */

            return ritorno;
        } catch (error) {
            return ritorno;
        }
    }

    /************************************** */


    async PrintMenu() {
        const tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        //console.log("Menu main, digita il numero della la tua scelta: ");
        await tmp.PrintMenuClassi();

    }
}
