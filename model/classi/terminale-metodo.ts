import { IClasseRiferimento, IDescrivibile, IMetodo, InizializzaLogbaseIn, InizializzaLogbaseOut, INonTrovato, IParametriEstratti, IParametro, IPrintabile, IRaccoltaPercorsi, IReturn, IRitornoValidatore, IsJsonString, targetTerminale, TipoParametro, TypeInterazone, TypeMetod, TypePosizione } from "../tools";
import { CheckClasseMetaData, GetListaClasseMetaData, SalvaListaClasseMetaData, TerminaleClasse } from "./terminale-classe";
import { TerminaleParametro } from "./terminale-parametro";
import helmet from "helmet";
import express, { Router, Request, Response, NextFunction } from "express";
import { GetListaMiddlewareMetaData, ListaTerminaleMetodo, ListaTerminaleMiddleware, SalvaListaMiddlewareMetaData } from "../liste/lista-terminale-metodo";
import { ListaTerminaleParametro } from "../liste/lista-terminale-parametro";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import cors from 'cors';

/* export interface ITerminaleMetodo {

} */
export class TerminaleMetodo implements IDescrivibile {

    static nomeMetadataKeyTarget = "MetodoTerminaleTarget";

    percorsi: IRaccoltaPercorsi;
    classePath = '';
    listaParametri: ListaTerminaleParametro;
    tipo: TypeMetod;
    tipoInterazione: TypeInterazone;
    nome: string | Symbol;
    metodoAvviabile: any;
    path: string;

    cors: any;
    helmet: any;

    middleware: any[] = [];

    descrizione: string;
    sommario: string;
    nomiClassiDiRiferimento: IClasseRiferimento[] = [];

    onChiamataCompletata?: (logOn: string, result: any, logIn: string) => void;
    onParametriNonTrovati?: (nonTrovati?: INonTrovato[]) => void;

    Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;
    onPrimaDiEseguireMetodo?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any[];
    onPrimaDiTerminareLaChiamata?: (res: IReturn) => IReturn;
    onPrimaDiEseguireExpress?: () => void;
    onPrimaDirestituireResponseExpress?: () => void;

    constructor(nome: string, path: string, classePath: string) {
        this.listaParametri = new ListaTerminaleParametro();
        this.nome = nome;
        this.path = path;
        this.classePath = classePath;
        this.tipo = 'get';
        this.tipoInterazione = "rotta";

        this.descrizione = "";
        this.sommario = "";
        this.nomiClassiDiRiferimento = [];

        this.percorsi = { pathGlobal: '', patheader: '', porta: 0 };
        //this.listaRotteGeneraChiavi = [];
    }

    ConfiguraRottaApplicazione(app: any, percorsi: IRaccoltaPercorsi) {
        this.percorsi.patheader = percorsi.patheader;
        this.percorsi.porta = percorsi.porta;
        const pathGlobal = percorsi.pathGlobal + '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
        const middlew: any[] = [];
        this.middleware.forEach(element => {

            if (element instanceof TerminaleMetodo) {
                const listaMidd = GetListaMiddlewareMetaData();
                const midd = listaMidd.CercaConNomeSeNoAggiungi(element.nome.toString());
                middlew.push(midd.ConvertiInMiddleare());
            }
        });
        if (this.metodoAvviabile != undefined) {
            var corsOptions = {};
            /* var corsOptions = {
                methods: this.tipo
            }

            if (this.helmet == undefined) {
                this.helmet = helmet();
            }
            if (this.cors == undefined) {
                this.cors = cors(corsOptions);
            }
            app.all("/" + this.percorsi.pathGlobal,
                cors(this.cors),
                //helmet(this.helmet),
                //middlew,
                async (req: Request, res: Response) => {
                    console.log('Risposta a chiamata : ' + this.percorsi.pathGlobal);
                    InizializzaLogbaseIn(req, this.nome.toString());
                    const tmp = await this.Esegui(req);
                    res.status(tmp.stato).send(tmp.body);
                    InizializzaLogbaseOut(res, this.nome.toString());
                    return res;
                }); */

            /*  */
            switch (this.tipo) {
                case 'get':
                    (<IReturn>this.metodoAvviabile).body;
                    /* const options: cors.CorsOptions = {
                        allowedHeaders: [
                          'Origin',
                          'X-Requested-With',
                          'Content-Type',
                          'Accept',
                          'X-Access-Token',
                        ],
                        credentials: true,
                        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
                        origin: API_URL,
                        preflightContinue: false,
                      }; */
                    corsOptions = {
                        allowedHeaders: [
                            'X-Requested-With',
                            'Content-Type',
                            'Accept',
                            'X-Access-Token',
                        ],
                        credentials: true,
                        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
                        preflightContinue: false,
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    app.get(this.percorsi.pathGlobal /* this.path */,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("GET");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'post':
                    corsOptions = {
                        allowedHeaders: [
                            'Origin',
                            'X-Requested-With',
                            'Content-Type',
                            'Accept',
                            'X-Access-Token',
                        ],
                        credentials: true,
                        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
                        preflightContinue: false,
                    }
                    /* corsOptions = {
                        methods: "POST"
                    }; */
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    (<IReturn>this.metodoAvviabile).body;
                    app.post(this.percorsi.pathGlobal,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("POST");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'delete':
                    (<IReturn>this.metodoAvviabile).body;
                    corsOptions = {
                        methods: "DELETE"
                    }
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    app.delete(this.percorsi.pathGlobal,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("DELETE");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'patch':
                    corsOptions = {
                        methods: "PATCH"
                    };
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    (<IReturn>this.metodoAvviabile).body;
                    app.patch(this.percorsi.pathGlobal,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("PATCH");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'purge':
                    corsOptions = {
                        methods: "PURGE"
                    };
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    (<IReturn>this.metodoAvviabile).body;
                    app.purge(this.percorsi.pathGlobal,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("PURGE");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'put':
                    corsOptions = {
                        methods: "PUT"
                    };
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    (<IReturn>this.metodoAvviabile).body;
                    app.put(this.percorsi.pathGlobal,
                        /* this.cors,
                        this.helmet,
                        middlew, */
                        async (req: Request, res: Response) => {
                            console.log("PUT");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
            }
        }
    }
    async ChiamataGenerica(req: Request, res: Response) {
        let passato = false;
        try {
            console.log('Risposta a chiamata : ' + this.percorsi.pathGlobal);
            const logIn = InizializzaLogbaseIn(req, this.nome.toString());
            let tmp: IReturn = await this.Esegui(req);
            if (this.onParametriNonTrovati) this.onParametriNonTrovati(tmp.nonTrovati);
            if (this.onPrimaDiTerminareLaChiamata) tmp = this.onPrimaDiTerminareLaChiamata(tmp);
            try {
                //res.status(tmp.stato).send(tmp.body);
                let num = 0;
                num = tmp.stato;
                //num = 404; 
                res.statusCode = Number.parseInt('' + num);
                res.send(tmp.body);
                passato = true;
            } catch (error) {
                res.status(500).send(error);
            }
            const logOit = InizializzaLogbaseOut(res, this.nome.toString());
            if (this.onChiamataCompletata) {
                this.onChiamataCompletata(logIn, tmp, logOit);
            }
            //return res;
        } catch (error) {
            if (this.onChiamataCompletata) {
                this.onChiamataCompletata('', { stato: 500, body: error }, '');
            }
            if (passato == false)
                res.status(500).send(error);
            //return res;
        }
    }

    CercaParametroSeNoAggiungi(nome: string, parameterIndex: number, tipoParametro: TipoParametro, posizione: TypePosizione) {
        const tmp = new TerminaleParametro(nome, tipoParametro, posizione, parameterIndex);
        this.listaParametri.push(tmp);//.lista.push({ propertyKey: propertyKey, Metodo: target });
        return tmp;
    }
    async Esegui(req: Request): Promise<IReturn> {
        try {
            console.log('Risposta a chiamata : ' + this.percorsi.pathGlobal);
            const parametri = this.listaParametri.EstraiParametriDaRequest(req);
            let valido: IRitornoValidatore | undefined = { approvato: true, stato: 200, messaggio: '' };
            if (this.Validatore) valido = this.Validatore(parametri, this.listaParametri);
            if ((valido && valido.approvato) || (!valido && parametri.errori.length == 0)) {
                let tmp: IReturn = {
                    body: {}, nonTrovati: parametri.nontrovato,
                    inErrore: parametri.errori, stato: 200
                };
                try {
                    let parametriTmp = parametri.valoriParametri;
                    if (this.onPrimaDiEseguireMetodo) parametriTmp = this.onPrimaDiEseguireMetodo(parametri,
                        this.listaParametri);
                    const tmpReturn = await this.metodoAvviabile.apply(this.metodoAvviabile, parametriTmp);
                    if (IsJsonString(tmpReturn)) {
                        if ('body' in tmpReturn) { tmp.body = tmpReturn.body; }
                        else { tmp.body = tmpReturn; }
                        if ('stato' in tmpReturn) { tmp.stato = tmpReturn.stato; }
                        else { tmp.stato = 299; }
                    }
                    else {
                        if (tmpReturn) {
                            tmp.body = tmpReturn;
                            tmp.stato = 299;
                        }
                        else {
                            tmp = {
                                body: { "Errore Interno filtrato ": 'internal error!!!!' },
                                stato: 500,
                                nonTrovati: parametri.nontrovato
                            };
                        }

                    }

                } catch (error) {
                    console.log("Errore : \n" + error);
                    tmp = {
                        body: { "Errore Interno filtrato ": 'internal error!!!!' },
                        stato: 500,
                        nonTrovati: parametri.nontrovato
                    };
                }
                return tmp;
            }
            else {
                let tmp: IReturn = {
                    body: parametri.errori,
                    nonTrovati: parametri.nontrovato,
                    inErrore: parametri.errori,
                    stato: 500
                };
                if (valido) {
                    tmp = {
                        body: valido.messaggio,
                        stato: 500,
                    }
                } else {
                    tmp = {
                        body: parametri.errori,
                        nonTrovati: parametri.nontrovato,
                        inErrore: parametri.errori,
                        stato: 500
                    };
                }
                return tmp;
            }
        } catch (error) {
            console.log("Errore : ", error);
            return {
                body: { "Errore Interno filtrato ": 'internal error!!!!' },
                stato: 500
            };
        }
    }
    ConvertiInMiddleare() {
        return async (req: Request, res: Response, nex: NextFunction) => {
            try {
                const tmp = await this.Esegui(req);
                if (tmp.stato >= 300) {
                    throw new Error("Errore : " + tmp.body);
                }
                else {
                    nex();
                    return nex;
                }
            } catch (error) {
                res.status(555).send("Errore : " + error);
            }
        };
    }
}


/**
 * crea una rotta con il nome della classe e la aggiunge alla classe di riferimento, il tipo del metodo dipende dal tipo di parametro.
 * @param parametri : 
 * tipo?: Specifica il tipo, questo puo essere: "get" | "put" | "post" | "patch" | "purge" | "delete" 
 * path?: specifica il percorso di una particolare, se non impostato prende il nome della classe  
 * interazione?: l'interazione è come viene gestito il metodo, puo essere : "rotta" | "middleware" | "ambo"  
 * descrizione?: la descrizione è utile piu nel menu o in caso di output  
 * sommario?: il sommario è una versione piu semplice della descrizione  
 * nomiClasseRiferimento?: questa è la strada per andare ad assegnare questa funzione è piu classi o sotto percorsi  
 * onChiamataCompletata?: (logOn: string, result: any, logIn: string) => void 
 * Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;
 * @returns 
 */
function decoratoreMetodo(parametri: IMetodo): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        /* inizializzo metodo */
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        /* inizio a lavorare sul metodo */
        if (metodo != undefined && list != undefined && classe != undefined) {
            /* metodo.metodoAvviabile = function (...args: any[]) {
                var originalMethod = descriptor.value;
                return originalMethod.apply(this, args);
            } */
            metodo.metodoAvviabile = descriptor.value;//la prendo come riferimento 
            /* descriptor.value = function (...args: any[]) {
                funcToCallEveryTime(...args);
                return originalMethod.apply(this, args);
            } */
            /* var originalMethod = descriptor.value;

            descriptor.value = metodo.metodoAvviabile; */


            if (parametri.nomiClasseRiferimento != undefined)
                metodo.nomiClassiDiRiferimento = parametri.nomiClasseRiferimento;

            if (parametri.tipo != undefined) metodo.tipo = parametri.tipo;
            else if (parametri.tipo == undefined && metodo.listaParametri.length == 0) metodo.tipo = 'get';
            else if (parametri.tipo == undefined && metodo.listaParametri.length > 0) metodo.tipo = 'post';
            //else if (parametri.tipo == undefined && metodo.listaParametri.length < 0) metodo.tipo = 'post';
            else metodo.tipo = 'get';

            if (parametri.descrizione != undefined) metodo.descrizione = parametri.descrizione;
            else metodo.descrizione = '';

            if (parametri.sommario != undefined) metodo.sommario = parametri.sommario;
            else metodo.sommario = '';

            if (parametri.interazione != undefined) metodo.tipoInterazione = parametri.interazione;
            else metodo.tipoInterazione = 'rotta';

            if (parametri.path == undefined) metodo.path = propertyKey.toString();
            else metodo.path = parametri.path;

            if (parametri.onChiamataCompletata != null) metodo.onChiamataCompletata = parametri.onChiamataCompletata;

            if (parametri.Validatore != null) metodo.Validatore = parametri.Validatore;

            /* configuro i middleware */
            if (parametri.interazione == 'middleware' || parametri.interazione == 'ambo') {

                const listaMidd = GetListaMiddlewareMetaData();
                const midd = listaMidd.CercaConNomeSeNoAggiungi(propertyKey.toString());
                midd.metodoAvviabile = descriptor.value;
                midd.listaParametri = metodo.listaParametri;
                SalvaListaMiddlewareMetaData(listaMidd);
            }
            if (parametri.nomiClasseRiferimento != undefined && parametri.nomiClasseRiferimento.length > 0) {
                for (let index = 0; index < parametri.nomiClasseRiferimento.length; index++) {
                    const element = parametri.nomiClasseRiferimento[index];
                    const classeTmp = list.CercaConNomeSeNoAggiungi(element.nome);
                    const metodoTmp = classeTmp.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
                    /* configuro il metodo */
                    metodoTmp.metodoAvviabile = descriptor.value;

                    if (parametri.tipo != undefined) metodoTmp.tipo = parametri.tipo;
                    else metodoTmp.tipo = 'get';

                    if (parametri.descrizione != undefined) metodoTmp.descrizione = parametri.descrizione;
                    else metodoTmp.descrizione = '';

                    if (parametri.sommario != undefined) metodoTmp.sommario = parametri.sommario;
                    else metodoTmp.sommario = '';

                    if (parametri.interazione != undefined) metodoTmp.tipoInterazione = parametri.interazione;
                    else metodoTmp.tipoInterazione = 'rotta';

                    if (parametri.path == undefined) metodoTmp.path = propertyKey.toString();
                    else metodoTmp.path = parametri.path;

                    for (let index = 0; index < metodo.listaParametri.length; index++) {
                        const element = metodo.listaParametri[index];
                        /* configuro i parametri */
                        const paramestro = metodoTmp.CercaParametroSeNoAggiungi(element.nomeParametro, element.indexParameter,
                            element.tipoParametro, element.posizione);
                        if (parametri.descrizione != undefined) paramestro.descrizione = element.descrizione;
                        else paramestro.descrizione = '';

                        if (parametri.sommario != undefined) paramestro.sommario = element.sommario;
                        else paramestro.sommario = '';

                    }
                    if (element.listaMiddleware) {
                        for (let index = 0; index < element.listaMiddleware.length; index++) {
                            const middlewareTmp = element.listaMiddleware[index];
                            let midd = undefined;
                            const listaMidd = GetListaMiddlewareMetaData();
                            if (typeof middlewareTmp === 'string' || middlewareTmp instanceof String) {
                                midd = listaMidd.CercaConNomeSeNoAggiungi(String(middlewareTmp));
                                SalvaListaMiddlewareMetaData(listaMidd);
                            }
                            else {
                                midd = middlewareTmp;
                            }


                            if (metodoTmp != undefined && list != undefined && classeTmp != undefined) {
                                metodoTmp.middleware.push(midd);
                                SalvaListaClasseMetaData(list);
                            }
                            else {
                                console.log("Errore mio!");
                            }
                        }
                    }
                }
            }
            SalvaListaClasseMetaData(list);
        }
        else {
            console.log("Errore mio!");
        }
        return descriptor;
    }
}

export function mpAddCors(cors: any): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        if (metodo != undefined && list != undefined && classe != undefined && metodo.nomiClassiDiRiferimento.length > 0) {
            for (let index = 0; index < metodo.nomiClassiDiRiferimento.length; index++) {
                const element = metodo.nomiClassiDiRiferimento[index];
                const classe2 = list.CercaConNomeSeNoAggiungi(element.nome);
                const metodo2 = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
                if (metodo2 != undefined && list != undefined && classe2 != undefined) {
                    metodo2.cors = cors;
                }
                else {
                    console.log("Errore mio!");
                }
            }
        }
        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.cors = cors;
        }
        else {
            console.log("Errore mio!");
        }
        SalvaListaClasseMetaData(list);
    }
}
export function mpAddHelmet(helmet: any): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        if (metodo != undefined && list != undefined && classe != undefined && metodo.nomiClassiDiRiferimento.length > 0) {
            for (let index = 0; index < metodo.nomiClassiDiRiferimento.length; index++) {
                const element = metodo.nomiClassiDiRiferimento[index];
                const classe2 = list.CercaConNomeSeNoAggiungi(element.nome);
                const metodo2 = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
                if (metodo2 != undefined && list != undefined && classe2 != undefined) {
                    metodo.helmet = helmet;
                }
                else {
                    console.log("Errore mio!");
                }
            }
        }
        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.helmet = helmet;
        }
        else {
            console.log("Errore mio!");
        }
        SalvaListaClasseMetaData(list);
    }
}
export function mpAddMiddle(item: any): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());

        let midd = undefined;
        const listaMidd = GetListaMiddlewareMetaData();
        if (typeof item === 'string' || item instanceof String) {
            midd = listaMidd.CercaConNomeSeNoAggiungi(String(item));
            SalvaListaMiddlewareMetaData(listaMidd);
        }
        else {
            midd = item;
        }


        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.middleware.push(midd);
            SalvaListaClasseMetaData(list);
        }
        else {
            console.log("Errore mio!");
        }
    }
}


export { decoratoreMetodo as mpMet };
