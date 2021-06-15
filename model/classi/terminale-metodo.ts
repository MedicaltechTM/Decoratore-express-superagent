import { ErroreMio, IClasseRiferimento, IDescrivibile, IMetodo, InizializzaLogbaseIn, InizializzaLogbaseOut, INonTrovato, IParametriEstratti, IParametro, IPrintabile, IRaccoltaPercorsi, IReturn, IRitornoValidatore, IsJsonString, targetTerminale, tipo, TypeInterazone, TypeMetod, TypePosizione } from "../tools";
import { CheckClasseMetaData, GetListaClasseMetaData, SalvaListaClasseMetaData, TerminaleClasse } from "./terminale-classe";
import { TerminaleParametro } from "./terminale-parametro";
import helmet from "helmet";
import express, { Router, Request, Response, NextFunction } from "express";
import { GetListaMiddlewareMetaData, ListaTerminaleMetodo, ListaTerminaleMiddleware, SalvaListaMiddlewareMetaData } from "../liste/lista-terminale-metodo";
import { ListaTerminaleParametro } from "../liste/lista-terminale-parametro";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import cors from 'cors';

import superagent, { head } from "superagent";

import http from "http";
/* export interface ITerminaleMetodo {

} */
export class TerminaleMetodo implements IDescrivibile {
    /**Specifica se il percorso dato deve essere concatenato al percorso della classe o se è da prendere singolarmente di default è falso e quindi il percorso andra a sommarsi al percorso della classe */
    percorsoIndipendente?: boolean;

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

    onChiamataCompletata?: (logOut: any, result: any, logIn: any, errore: any) => void;
    onParametriNonTrovati?: (nonTrovati?: INonTrovato[]) => void;

    Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;
    onPrimaDiEseguireMetodo?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any[];
    onPrimaDiTerminareLaChiamata?: (res: IReturn) => IReturn;
    onPrimaDiEseguireExpress?: (req: Request) => void;
    onPrimaDirestituireResponseExpress?: () => void;
    AlPostoDi?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any;
    Istanziatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any;

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

        let percorsoTmp = '';
        if (this.percorsoIndipendente) {
            percorsoTmp = '/' + this.path;
            this.percorsi.pathGlobal = percorsoTmp;
        }
        else
            percorsoTmp = this.percorsi.pathGlobal;


        if (this.metodoAvviabile != undefined) {
            let corsOptions = {};
            switch (this.tipo) {
                case 'get':
                    (<IReturn>this.metodoAvviabile).body;
                    corsOptions = {
                        methods: 'GET',
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    app.get(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
                        async (req: Request, res: Response) => {
                            console.log("GET");
                            await this.ChiamataGenerica(req, res);
                        });
                    break;
                case 'post':
                    corsOptions = {
                        methods: 'POST'
                    }
                    if (this.helmet == undefined) {
                        this.helmet = helmet();
                    }
                    if (this.cors == undefined) {
                        this.cors = cors(corsOptions);
                    }
                    (<IReturn>this.metodoAvviabile).body;
                    app.post(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
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
                    app.delete(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
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
                    app.patch(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
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
                    app.purge(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
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
                    app.put(percorsoTmp,
                        this.cors,
                        this.helmet,
                        middlew,
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
        let logIn: any;
        let logOut: any;
        let tmp: any;
        try {
            console.log('Inizio Chiamata generica per : ' + this.percorsi.pathGlobal);
            logIn = InizializzaLogbaseIn(req, this.nome.toString());
            if (this.onPrimaDiEseguireExpress) this.onPrimaDiEseguireExpress(req);
            tmp = await this.Esegui(req);
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
            logOut = InizializzaLogbaseOut(res, this.nome.toString());
            if (this.onChiamataCompletata) {
                this.onChiamataCompletata(logIn, tmp, logOut, undefined);
            }
            //return res;
        } catch (error) {
            if (this.onChiamataCompletata) {
                this.onChiamataCompletata(logIn, tmp , logOut,error);
            }
            if (passato == false)
                res.status(500).send(error);
            //return res;
        }
    }

    CercaParametroSeNoAggiungi(nome: string, parameterIndex: number, tipo: tipo, posizione: TypePosizione) {
        const tmp = new TerminaleParametro(nome, tipo, posizione, parameterIndex);
        this.listaParametri.push(tmp);//.lista.push({ propertyKey: propertyKey, Metodo: target });
        return tmp;
    }
    async Esegui(req: Request): Promise<IReturn> {
        try {
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
                    let tmpReturn: any = '';
                    if (this.AlPostoDi) {
                        tmpReturn = await this.AlPostoDi(parametri, this.listaParametri);
                    }
                    else {
                        if (this.Istanziatore) {
                            const classeInstanziata = await this.Istanziatore(parametri, this.listaParametri);
                            tmp.attore = classeInstanziata;
                            tmpReturn = await classeInstanziata[this.nome.toString()](this.metodoAvviabile, parametriTmp);

                            //tmpReturn = await (<Object>classeInstanziata).constructor.caller(this.nome).apply(this.metodoAvviabile, parametriTmp);
                            //classeInstanziata[this.nome].apply()
                            //tmpReturn = await this.metodoAvviabile.apply(this.metodoAvviabile, parametriTmp);
                        }
                        else {
                            tmpReturn = await this.metodoAvviabile.apply(this.metodoAvviabile, parametriTmp);
                        }
                    }
                    console.log('Risposta a chiamata : ' + this.percorsi.pathGlobal);
                    if (IsJsonString(tmpReturn)) {
                        if (tmpReturn.name === "ErroreMio" || tmpReturn.name === "ErroreGenerico") {
                            console.log("ciao");
                        }
                        if ('body' in tmpReturn) { tmp.body = tmpReturn.body; }
                        else { tmp.body = tmpReturn; }
                        if ('stato' in tmpReturn) { tmp.stato = tmpReturn.stato; }
                        else { tmp.stato = 299; }
                    }
                    else {
                        /* if (tmpReturn.name === "ErroreMio" || tmpReturn.name === "ErroreGenerico") {
                            console.log('ciao');
                        }
                        if (tmpReturn instanceof ErroreMio) {
                            console.log('hello');
                        } */


                        if (typeof tmpReturn === 'object' && tmpReturn !== null && 'stato' in tmpReturn && 'body' in tmpReturn) {
                            /* const tt = Object.assign({}, tmpReturn.body);
                            const tt2 = Object.assign(tmpReturn.body);
                            const tt3 = Object.create(tmpReturn.body);
                            const tt4 = Object.create({}, tmpReturn.body);
 
                            const tt5 = Object.assign(tmp.body, tmpReturn.body);
                            const tt6 = Object.create(<any>tmp.body, tmpReturn.body); */

                            for (let attribut in tmpReturn.body) {
                                (<any>tmp.body)[attribut] = tmpReturn.body[attribut];
                            }

                            //tmp.body = Object.assign({}, tmpReturn.body);
                            tmp.stato = tmpReturn.stato;
                        }
                        else if (tmpReturn) {
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
                    console.log(tmpReturn);
                    console.log("finito!!")
                } catch (error) {
                    if (error instanceof ErroreMio) {
                        tmp = {
                            body: {
                                "Errore Interno filtrato ": 'filtrato 404 !!!',
                                'Errore originale': (<ErroreMio>error).message
                            },
                            stato: (<ErroreMio>error).codiceErrore
                        };
                    }
                    else {
                        tmp = {
                            body: { "Errore Interno filtrato ": 'internal error!!!!' },
                            stato: 500,
                            nonTrovati: parametri.nontrovato
                        };
                    }
                    console.log("Errore : \n" + error);
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
        } catch (error: any) {
            if ('name' in error && error.name === "ErroreMio" || error.name === "ErroreGenerico") {
                console.log("ciao");
            }
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

    /************************************************************************* */


    PrintStamp(): string {
        let parametri = "";
        for (let index = 0; index < this.listaParametri.length; index++) {
            const element = this.listaParametri[index];
            parametri = parametri + element.PrintParametro();
        }
        const tmp = this.nome + ' | ' + this.percorsi.pathGlobal + '\n\t' + parametri;
        //console.log(tmp);
        return tmp;
    }


    async ChiamaLaRotta(headerpath?: string) {
        try {

            let body = "";
            let query = "";
            let header = "";
            for (let index = 0; index < this.middleware.length; index++) {
                const element = this.middleware[index];

                if (element instanceof TerminaleMetodo) {
                    const listaMidd = GetListaMiddlewareMetaData();
                    const midd = listaMidd.CercaConNomeSeNoAggiungi(element.nome.toString());
                    const rit = await midd.listaParametri.SoddisfaParamtri('middleware');

                    if (rit.body != "") {
                        if (body != "") {
                            body = body + ", " + rit.body;
                        } else {
                            body = rit.body;
                        }
                    }
                    if (rit.query != "") {
                        if (query != "") {
                            query = query + ", " + rit.query;
                        } else
                            query = rit.query;
                    }
                    if (rit.header != "") {
                        if (header != "") {
                            header = header + ", " + rit.header;
                        } else
                            header = rit.header;
                    }
                }
            }

            if (headerpath == undefined) headerpath = "localhost:3000";
            console.log('chiamata per : ' + this.percorsi.pathGlobal + ' | Verbo: ' + this.tipo);
            const parametri = await this.listaParametri.SoddisfaParamtri('rotta');

            if (parametri.body != "") {
                if (body != "") {
                    body = body + ", " + parametri.body;
                } else {
                    body = parametri.body;
                }
            }
            if (parametri.query != "") {
                if (query != "") {
                    query = query + ", " + parametri.query;
                } else
                    query = parametri.query;
            }
            if (parametri.header != "") {
                if (header != "") {
                    header = header + ", " + parametri.header;
                } else
                    header = parametri.header;
            }

            let ritorno;
            let gg = this.percorsi.patheader + this.percorsi.porta + this.percorsi.pathGlobal
            try {
                ritorno = await superagent(this.tipo, this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                    .query(JSON.parse('{ ' + query + ' }'))
                    .send(JSON.parse('{ ' + body + ' }'))
                    .set(JSON.parse('{ ' + header + ' }'))
                    .set('accept', 'json')
                    ;
            } catch (error) {
                console.log(error);
                throw new Error("Errore:" + error);
            }
            /* switch (this.tipo) {
                case 'get':
                    try {
                        ritorno = await superagent
                            .get(this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                            .query(JSON.parse('{ ' + query + ' }'))
                            .send(JSON.parse('{ ' + body + ' }'))
                            .set(JSON.parse('{ ' + header + ' }'))
                            .set('accept', 'json')
                            ;
                    } catch (error) {
                        console.log(error);
                        throw new Error("Errore:" + error);
                    }
                    break;
                case 'post':
                    try {
                        ritorno = await superagent
                            .post(this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                            .query(JSON.parse('{ ' + query + ' }'))
                            .send(JSON.parse('{ ' + body + ' }'))
                            .set(JSON.parse('{ ' + header + ' }'))
                            .set('accept', 'json')
                    } catch (error) {
                        console.log(error);
                        throw new Error("Errore:" + error);
                    }
                    break;
                case 'purge':
                    try {
                        ritorno = await superagent
                            .purge(this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                            .query(JSON.parse('{ ' + query + ' }'))
                            .send(JSON.parse('{ ' + body + ' }'))
                            .set(JSON.parse('{ ' + header + ' }'))
                            .set('accept', 'json')
                    } catch (error) {
                        console.log(error);
                        throw new Error("Errore:" + error);
                    }
                    break;
                case 'patch':
                    try {
                        ritorno = await superagent
                            .patch(this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                            .query(JSON.parse('{ ' + query + ' }'))
                            .send(JSON.parse('{ ' + body + ' }'))
                            .set(JSON.parse('{ ' + header + ' }'))
                            .set('accept', 'json')
                    } catch (error) {
                        console.log(error);
                        throw new Error("Errore:" + error);
                    }
                    break;
                case 'delete':
                    try {
                        ritorno = await superagent
                            .delete(this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                            .query(JSON.parse('{ ' + query + ' }'))
                            .send(JSON.parse('{ ' + body + ' }'))
                            .set(JSON.parse('{ ' + header + ' }'))
                            .set('accept', 'json')
                    } catch (error) {
                        console.log(error);
                        throw new Error("Errore:" + error);
                    }
                    break;
                default:
                    return '';
                    break;
            } */

            if (ritorno) {
                return ritorno.body;
            } else {
                return '';
            }
            /*  */
        } catch (error) {
            throw new Error("Errore :" + error);
        }
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

            if (parametri.percorsoIndipendente) metodo.percorsoIndipendente = parametri.percorsoIndipendente;
            else metodo.percorsoIndipendente = false;

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

            if (parametri.onPrimaDiEseguireExpress != null) metodo.onPrimaDiEseguireExpress = parametri.onPrimaDiEseguireExpress;

            if (parametri.AlPostoDi != null && parametri.AlPostoDi != undefined) {
                metodo.AlPostoDi = parametri.AlPostoDi;
            }

            if (parametri.Istanziatore != null && parametri.Istanziatore != undefined) {
                metodo.Istanziatore = parametri.Istanziatore;
            }
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
                        const paramestro = metodoTmp.CercaParametroSeNoAggiungi(element.nome, element.indexParameter,
                            element.tipo, element.posizione);
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
        //return descriptor;
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
