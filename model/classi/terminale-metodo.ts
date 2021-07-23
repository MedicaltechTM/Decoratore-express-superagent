import { ErroreMio, IClasseRiferimento, IDescrivibile, IHtml, IMetodo, InizializzaLogbaseIn, InizializzaLogbaseOut, INonTrovato, IParametriEstratti, IRaccoltaPercorsi, IReturn, IRitornoValidatore, IsJsonString, tipo, TypeInterazone, TypeMetod, TypePosizione } from "../tools";
import { GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import { TerminaleParametro } from "./terminale-parametro";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { GetListaMiddlewareMetaData, SalvaListaMiddlewareMetaData } from "../liste/lista-terminale-metodo";
import { ListaTerminaleParametro } from "../liste/lista-terminale-parametro";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import cors from 'cors';

import fs from "fs";

import superagent from "superagent";

import Handlebars from "handlebars";

/* export interface ITerminaleMetodo {

} */

export class Risposta {
    stato: number;
    descrizione: string;
    valori: {
        nome: string,
        tipo: tipo,
        note?: string
    }[];

    trigger?: { nome: string, valre: any, posizione: TypePosizione };
    htmlPath?: string;
    html?: string;
    isHandlebars?: boolean;

    constructor() {
        this.stato = 200;
        this.descrizione = '';
        this.valori = [];
        this.isHandlebars = false;
    }
}

export class TerminaleMetodo implements IDescrivibile {

    swaggerClassi: string[] = [];

    schemaSwagger?: any;

    htmlHandlebars: {
        percorso: string, contenuto: string, percorsoIndipendente?: boolean,
        listaParametri?: { nome: string, valore: string }[]
    }[] = [];

    html: IHtml[] = [];

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

    listaTest: {
        body: any, query: any, header: any
    }[] = [];

    Risposte?: Risposta[] = []

    /* RispondiConHTML?: {
        trigger?: { nome: string, valre: any, posizione: TypePosizione },
        risposta: {
            "1xx"?: {
                htmlPath?: string,
                html?: string
            },
            "2xx"?: {
                htmlPath?: string,
                html?: string
            },
            "3xx"?: {
                htmlPath?: string,
                html?: string
            },
            "4xx"?: {
                htmlPath?: string,
                html?: string
            },
            "5xx"?: {
                htmlPath?: string,
                html?: string
            }
        }
    }; */

    onChiamataCompletata?: (logOut: any, result: any, logIn: any, errore: any) => void;
    onChiamataInErrore?: (logOut: any, result: any, logIn: any, errore: any) => IReturn;
    onParametriNonTrovati?: (nonTrovati?: INonTrovato[]) => void;
    onPrimaDiEseguireMetodo?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any[];
    onPrimaDiTerminareLaChiamata?: (res: IReturn) => IReturn;
    onPrimaDiEseguireExpress?: (req: Request) => void;
    onModificaRispostaExpress?: (dati: IReturn) => IReturn;
    onPrimaDirestituireResponseExpress?: () => void;

    Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore | void;
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

        /*  */
        //const pathGlobal = percorsi.pathGlobal + '/' + this.path;
        //this.percorsi.pathGlobal = pathGlobal;

        const pathGlobalTmp = percorsi.pathGlobal;
        const pathGlobal = percorsi.pathGlobal + '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
        /*  */

        const middlew: any[] = [];
        this.middleware.forEach(element => {
            if (element instanceof TerminaleMetodo) {
                const listaMidd = GetListaMiddlewareMetaData();
                const midd = listaMidd.CercaConNomeSeNoAggiungi(element.nome.toString());
                middlew.push(midd.ConvertiInMiddleare());
            }
        });

        let percorsoTmp = '';
        /*  */

        /* if (this.percorsoIndipendente) percorsoTmp = '/' + this.path;
        else percorsoTmp = this.percorsi.pathGlobal + '/' + this.path; */
        if (this.percorsoIndipendente) {
            percorsoTmp = '/' + this.path;
            this.percorsi.pathGlobal = percorsoTmp;
        }
        else {
            percorsoTmp = this.percorsi.pathGlobal;
        }
        /*  */

        if (this.metodoAvviabile != undefined) {
            this.ConfiguraRotteSwitch(app, percorsoTmp, middlew);
        }

        if (this.html) {
            percorsoTmp = '';
            for (let index = 0; index < this.html.length; index++) {
                const element = this.html[index];
                if (element.percorsoIndipendente) percorsoTmp = '/' + element.path;
                else percorsoTmp = pathGlobalTmp + '/' + element.path;

                if (this.metodoAvviabile != undefined) {
                    this.ConfiguraRotteHtml(app, percorsoTmp, element.contenuto);
                }
            }

        }

    }
    ConfiguraRotteSwitch(app: any, percorsoTmp: string, middlew: any[]) {
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
                        ////console.log("GET");
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
                        //console.log("POST");
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
                        //console.log("DELETE");
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
                        //console.log("PATCH");
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
                        //console.log("PURGE");
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
                        //console.log("PUT");
                        await this.ChiamataGenerica(req, res);
                    });
                break;
        }
    }
    ConfiguraRotteHtml(app: any, percorsoTmp: string, contenuto: string) {
        (<IReturn>this.metodoAvviabile).body;
        let corsOptions = {};
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
            /* this.cors,
            this.helmet, */
            async (req: Request, res: Response) => {
                if (this.html)
                    res.send(contenuto);
                else
                    res.sendStatus(404);
            });
    }

    async ChiamataGenerica(req: Request, res: Response) {
        let passato = false;
        let logIn: any;
        let logOut: any;
        let tmp: IReturn | undefined;
        try {
            //console.log('Inizio Chiamata generica per : ' + this.percorsi.pathGlobal);
            logIn = InizializzaLogbaseIn(req, this.nome.toString());
            if (this.onPrimaDiEseguireExpress) this.onPrimaDiEseguireExpress(req);
            tmp = await this.Esegui(req);
            if (this.onModificaRispostaExpress)
                tmp = await this.onModificaRispostaExpress(tmp ?? { body: '', stato: 1 });
            if (tmp != undefined) {
                if (this.onParametriNonTrovati) this.onParametriNonTrovati(tmp.nonTrovati);
                if (this.onPrimaDiTerminareLaChiamata) tmp = this.onPrimaDiTerminareLaChiamata(tmp);
                try {
                    if (!this.VerificaTrigger(req)) {
                        this.Rispondi(res, tmp);
                    }
                    else {
                        const risposta = this.CercaRispostaConTrigger(req);
                        if (risposta) {
                            let source = "";
                            if (risposta.stato >= 1 && risposta.stato < 600) {
                                if (risposta.htmlPath != undefined)
                                    source = fs.readFileSync(risposta.htmlPath).toString();
                                else if (risposta.html != undefined)
                                    source = risposta.html;
                                else
                                    throw new Error("Errorissimo");
                            }
                            if (risposta.isHandlebars) {
                                const template = Handlebars.compile(source);
                                const result = template(tmp.body);
                                res.statusCode = Number.parseInt('' + risposta.stato);
                                res.send(result);
                                passato = true;
                            } else {
                                this.Rispondi(res, tmp);
                                passato = true;
                            }
                        }
                        else {
                            throw new Error("Errore gnel trigger");
                        }
                    }
                } catch (error) {
                    res.status(598).send(error);
                }
                logOut = InizializzaLogbaseOut(res, this.nome.toString());
                if (this.onChiamataCompletata) {
                    this.onChiamataCompletata(logIn, tmp, logOut, undefined);
                }
            }
            else {
                throw new Error("Attenzione qualcosa è andato storto nell'Esegui(req), guarda @mpMet");
            }
            //return res;
        } catch (error) {
            /* if (this.onChiamataCompletata) {
                this.onChiamataCompletata(logIn, tmp, logOut, error);
            } */
            if (this.onChiamataInErrore) {
                tmp = await this.onChiamataInErrore(logIn, tmp, logOut, error);
                let num = 0;
                num = tmp.stato;
                //num = 404; 
                res.statusCode = Number.parseInt('' + num);
                res.send(tmp.body);
            }
            else if (passato == false) {
                res.status(500).send(error);
            }
            else {
                res.status(599).send(error);
            }
            //return res;
        }
    }
    Rispondi(res: Response, item: IReturn) {
        res.statusCode = Number.parseInt('' + item.stato);
        res.send(item.body);
    }

    VerificaTrigger(richiesta: Request): boolean {

        let tmp = undefined;

        if (this.Risposte) {
            for (let index = 0; index < this.Risposte.length; index++) {
                const element = this.Risposte[index];
                if (element && element.trigger) {
                    if (element.trigger.posizione == 'body')
                        tmp = richiesta.body[element.trigger.nome];
                    if (element.trigger.posizione == 'header')
                        tmp = richiesta.headers[element.trigger.nome];
                    if (element.trigger.posizione == 'query')
                        tmp = richiesta.query[element.trigger.nome];
                    if (tmp == element.trigger.valre) return true;
                }
            }
        }

        return false;
    }

    CercaRispostaConTrigger(richiesta: Request): Risposta | undefined {

        let tmp = undefined;

        if (this.Risposte) {
            for (let index = 0; index < this.Risposte.length; index++) {
                const element = this.Risposte[index];
                if (element && element.trigger) {
                    if (element.trigger.posizione == 'body')
                        tmp = richiesta.body[element.trigger.nome];
                    if (element.trigger.posizione == 'header')
                        tmp = richiesta.headers[element.trigger.nome];
                    if (element.trigger.posizione == 'query')
                        tmp = richiesta.query[element.trigger.nome];
                    if (tmp == element.trigger.valre) return element;
                }
            }
        }
        return undefined;
    }

    CercaParametroSeNoAggiungi(nome: string, parameterIndex: number, tipo: tipo, posizione: TypePosizione) {
        const tmp = new TerminaleParametro(nome, tipo, posizione, parameterIndex);
        this.listaParametri.push(tmp);//.lista.push({ propertyKey: propertyKey, Metodo: target });
        return tmp;
    }

    async Esegui(req: Request): Promise<IReturn | undefined> {
        try {
            const parametri = this.listaParametri.EstraiParametriDaRequest(req);
            let valido: IRitornoValidatore | undefined = { approvato: true, stato: 200, messaggio: '' };
            if (this.Validatore) valido = this.Validatore(parametri, this.listaParametri) ?? undefined;
            /* verifico che il metodo possa essere eseguito come volevasi ovvero approvato = true o undefiend */
            if ((valido && (valido.approvato == undefined || valido.approvato == true))
                || (!valido && parametri.errori.length == 0)) {
                let tmp: IReturn = {
                    body: {}, nonTrovati: parametri.nontrovato,
                    inErrore: parametri.errori, stato: 200
                };
                try {
                    const tmpReturn: any = await this.EseguiMetodo(parametri);
                    if (IsJsonString(tmpReturn)) {
                        if (tmpReturn.name === "ErroreMio" || tmpReturn.name === "ErroreGenerico") {
                            //console.log("ciao");
                        }
                        if ('body' in tmpReturn) { tmp.body = tmpReturn.body; }
                        else { tmp.body = tmpReturn; }
                        if ('stato' in tmpReturn) { tmp.stato = tmpReturn.stato; }
                        else { tmp.stato = 299; }
                    }
                    else {
                        if (typeof tmpReturn === 'object' && tmpReturn !== null &&
                            'stato' in tmpReturn && 'body' in tmpReturn) {
                            for (let attribut in tmpReturn.body) {
                                (<any>tmp.body)[attribut] = tmpReturn.body[attribut];
                            }
                            tmp.body = Object.assign({}, tmpReturn.body);
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
                    return tmp;
                } catch (error) {
                    if (error instanceof ErroreMio) {
                        tmp = {
                            body: {
                                "Errore Interno filtrato ": 'filtrato 404 !!!',
                                'Errore originale': (<ErroreMio>error).message,
                                'Stack errore': (<Error>error).stack
                            },
                            stato: (<ErroreMio>error).codiceErrore
                        };
                    }
                    else {
                        tmp = {
                            body: {
                                "Errore Interno filtrato ": 'internal error!!!!',
                                'Errore originale': (<Error>error).message,
                                'Stack errore': (<Error>error).stack,
                                nonTrovati: parametri.nontrovato
                            },
                            stato: 500
                        };
                    }
                }
            }/* altrimenti lo vado a costruire */
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
                }
                return tmp;
            }
            return undefined;
        } catch (error: any) {
            /* if ('name' in error && error.name === "ErroreMio" || error.name === "ErroreGenerico") {
                //console.log("ciao");
            } */
            //console.log("Errore : ", error);
            return <IReturn>{
                body: { "Errore Interno filtrato ": 'internal error!!!!' },
                stato: 500
            };
        }
    }

    async EseguiMetodo(parametri: IParametriEstratti) {
        let tmpReturn: any = '';
        if (this.AlPostoDi) {
            tmpReturn = await this.AlPostoDi(parametri, this.listaParametri);
        }
        else {
            if (this.Istanziatore) {
                const classeInstanziata = await this.Istanziatore(parametri, this.listaParametri);
                //const attore = classeInstanziata;
                tmpReturn = await classeInstanziata[this.nome.toString()].apply(classeInstanziata, parametri.valoriParametri);
                //tmpReturn = await classeInstanziata[this.nome.toString()](classeInstanziata, parametri.valoriParametri);
            }
            else {
                tmpReturn = await this.metodoAvviabile.apply(this.metodoAvviabile, parametri.valoriParametri);
            }
        }
        return tmpReturn;
    }
    ConvertiInMiddleare() {
        return async (req: Request, res: Response, nex: NextFunction) => {
            try {
                const tmp = await this.Esegui(req);
                if (tmp) {
                    if (tmp.stato >= 300) {
                        throw new Error("Errore : " + tmp.body);
                    }
                    else {
                        nex();
                        return nex;
                    }
                }
                else {
                    throw new Error("Attenzione qualcosa è andato storto nell'Esegui(req), guarda @mpMet")
                }
            } catch (error) {
                return res.status(555).send("Errore : " + error);
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
        ////console.log(tmp);
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
            //console.log('chiamata per : ' + this.percorsi.pathGlobal + ' | Verbo: ' + this.tipo);
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
            // let gg = this.percorsi.patheader + this.percorsi.porta + this.percorsi.pathGlobal
            try {
                ritorno = await superagent(this.tipo, this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                    .query(JSON.parse('{ ' + query + ' }'))
                    .send(JSON.parse('{ ' + body + ' }'))
                    .set(JSON.parse('{ ' + header + ' }'))
                    .set('accept', 'json')
                    ;
            } catch (error) {
                //console.log(error);
                if ('response' in error) {
                    return (<any>error).response.body;
                }
                throw new Error("Errore:" + error);
            }
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

    async ChiamaLaRottaConParametri(body: any, query: any, header: any) {
        try {
            let ritorno;
            // let gg = this.percorsi.patheader + this.percorsi.porta + this.percorsi.pathGlobal
            try {
                ritorno = await superagent(this.tipo, this.percorsi.patheader + ':' + this.percorsi.porta + this.percorsi.pathGlobal)
                    .query(query)
                    .send(body)
                    .set(header)
                    .set('accept', 'json')
                    ;
            } catch (error) {
                //console.log(error);
                if ('response' in error) {
                    return (<any>error).response.body;
                }
                throw new Error("Errore:" + error);
            }
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


    SettaSwagger() {

        if (this.tipoInterazione == 'middleware') {
            //questo deve restituire un oggetto
            /* let primo = false;
            let ritorno = '';
            for (let index = 0; index < this.middleware.length; index++) {
                const element = this.middleware[index];
                if (element instanceof TerminaleMetodo) {
                    const tt = element.SettaSwagger('middleware');
                    if (primo == false && tt != undefined) {
                        primo = true;
                        ritorno = tt + '';
                    } else if (tt != undefined) {
                        ritorno = ritorno + ',' + tt;
                    }
                }
            }
            for (let index = 0; index < this.listaParametri.length; index++) {
                const element = this.listaParametri[index];
                const tt = element.SettaSwagger(); 
                if (index == 0)
                    if (primo == false) ritorno = tt;
                    else ritorno = ritorno + ',' + tt;
                else ritorno = ritorno + ',' + tt;
                if (primo == false) primo = true;
            }
            //ritorno = ritorno;
            try {
                JSON.parse(ritorno)
            } catch (error) {
                console.log(error);
            }
            if (primo) return undefined;
            else return ritorno; */
            return undefined;
        }
        else {
            let schema = ``;
            let parameters = ``;
            let tags = '"' + this.nome + '"';
            for (let index = 0; this.swaggerClassi && index < this.swaggerClassi.length; index++) {
                const element = this.swaggerClassi[index];
                tags = tags + ', ';
                tags = tags + '"' + element + '"';
            }

            for (let index = 0; index < this.listaParametri.length; index++) {
                const element = this.listaParametri[index];
                if (index > 0) schema = schema + ', ';
                schema = schema + `"${element.nome}": {
                    "${element.nome}":{
                        "type": "${element.tipo}"
                    }
                }`;
            }

            for (let index = 0; index < this.listaParametri.length; index++) {
                const element = this.listaParametri[index];

                let properties = '';
                if (element.tipo == 'array' && element.schemaSwagger) {
                    for (let index2 = 0; index2 < element.schemaSwagger.length; index2++) {
                        const element2 = element.schemaSwagger[index2];
                        if (index2 > 0) properties = properties + ', ';
                        properties = properties +
                            `"${element2.nome}": {
                                    "type": "${element2.tipo}",
                                    "example": "${element2.valoreEsempio}"
                                }`;
                    }

                }
                let tipoArray = `"items": {
                    "type": "object",
                    "properties": {
                        ${properties}
                    }
                }`;
                if (index > 0) parameters = parameters + ', ';
                if (element.tipo == 'array' && element.schemaSwagger) {
                    if (element.obbligatorio) {
                        parameters = parameters +
                            `{
                            "in": "${element.posizione}",
                            "name": "${element.nome}",
                            "description": "Obbligatorio: ${element.obbligatorio}.${element.descrizione}",
                            "required": "${element.obbligatorio}",
                            "schema": {
                                "type": "array",
                                ${tipoArray}
                            }
                        }`;
                    } else {
                        parameters = parameters +
                            `{
                            "in": "${element.posizione}",
                            "name": "${element.nome}",
                            "description": "Obbligatorio: ${element.obbligatorio}.${element.descrizione}",
                            "schema": {
                                "type": "array",
                                ${tipoArray}
                            }
                        }`;
                    }
                    /* parameters = parameters + `{
                    "in": "${element.posizione}",
                    "name": "${element.nome}",
                    "description": "${element.descrizione}. Il parametro è obbligatorio: ${element.obbligatorio}",
                    "schema": {
                        "required": "${element.obbligatorio}",
                        "type": "array",
                        ${tipoArray}
                    }
                }`; */
                }
                else {
                    if (element.obbligatorio) {
                        parameters = parameters +
                            `{
                            "in": "${element.posizione}",
                            "name": "${element.nome}",
                            "description": "Obbligatorio: ${element.obbligatorio}.${element.descrizione}",
                            "required": "${element.obbligatorio}",
                            "schema": {
                                "type": "${element.tipo}"
                            }
                        }`;
                    } else {
                        parameters = parameters +
                            `{
                            "in": "${element.posizione}",
                            "name": "${element.nome}",
                            "description": "Obbligatorio: ${element.obbligatorio}.${element.descrizione}",
                            "schema": {
                                "type": "${element.tipo}"
                            }
                        }`;
                    }
                    /* parameters = parameters + `{
                    "in": "${element.posizione}",
                    "name": "${element.nome}",
                    "description": "${element.descrizione}. Il parametro è obbligatorio: ${element.obbligatorio}",
                    "schema": {
                        "required": "${element.obbligatorio}",
                        "type": "${element.tipo}"
                    }
                }
                `; */
                }

            }
            let risposte = "";
            if (this.Risposte) {
                for (let index = 0; index < this.Risposte.length; index++) {
                    const element = this.Risposte[index];
                    let tt = '';
                    for (let indexj = 0; indexj < element.valori.length; indexj++) {
                        const element2 = element.valori[indexj];
                        if (indexj > 0) tt = tt + ', ';
                        tt = tt +
                            `"${element2.nome}": {
                            "type": "${element2.tipo}"
                        }`;
                    }
                    if (index > 0) risposte = risposte + ', ';
                    risposte = risposte + `"${element.stato}": {
                        "description": "${element.descrizione}",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        ${tt}
                                    }
                                }
                            }
                        }
                    }`;
                }
            }

            const ritorno = `"${this.percorsi.pathGlobal}": {
                "${this.tipo}":{
                    "tags": [
                        ${tags}
                    ],
                    "summary": "${this.sommario}",
                    "description": "${this.descrizione}",
                    "operationId": "${this.nome}",
                    "parameters": [
                        ${parameters}
                    ],
                    "responses": {
                        ${risposte}
                    }
                }                
            }`;

            return ritorno;
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

            if (parametri.Risposte) metodo.Risposte = parametri.Risposte;

            if (parametri.listaHtml) {
                for (let index = 0; index < parametri.listaHtml.length; index++) {
                    const element = parametri.listaHtml[index];
                    if (element.percorsoIndipendente == undefined) element.percorsoIndipendente = false;

                    if (element.html != undefined && element.htmlPath == undefined
                        && metodo.html.find(x => { if (x.path == element.path) return true; else return false; }) == undefined) {
                        metodo.html?.push({
                            contenuto: element.html,
                            path: element.path,
                            percorsoIndipendente: element.percorsoIndipendente
                        });
                        // metodo.html?.contenuto = element.html;
                    } else if (element.html == undefined && element.htmlPath != undefined
                        && metodo.html.find(x => { if (x.path == element.path) return true; else return false; }) == undefined) {
                        metodo.html.push({
                            contenuto: fs.readFileSync(element.htmlPath).toString(),
                            path: element.path,
                            percorsoIndipendente: element.percorsoIndipendente
                        });
                        // metodo.html?.contenuto = fs.readFileSync(element.htmlPath).toString();
                    }
                }
            }
            if (parametri.onModificaRispostaExpress) metodo.onModificaRispostaExpress = parametri.onModificaRispostaExpress;
            /* if (parametri.RispondiConHTML)
                metodo.RispondiConHTML = parametri.RispondiConHTML; */

            if (parametri.listaTest)
                metodo.listaTest = parametri.listaTest;

            metodo.metodoAvviabile = descriptor.value;

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
                                //console.log("Errore mio!");
                            }
                        }
                    }
                }
            }

            if (parametri.swaggerClassi != undefined)
                metodo.swaggerClassi = parametri.swaggerClassi;


            SalvaListaClasseMetaData(list);
        }
        else {
            //console.log("Errore mio!");
        }
        //return descriptor;
    }
}

function decoratoreRitorno() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        /* inizializzo metodo */
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        /* inizio a lavorare sul metodo */
        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.Risposte?.push({ descrizione: '', stato: 0, valori: [], isHandlebars: false });
        }
    };
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
                    //console.log("Errore mio!");
                }
            }
        }
        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.cors = cors;
        }
        else {
            //console.log("Errore mio!");
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
                    //console.log("Errore mio!");
                }
            }
        }
        if (metodo != undefined && list != undefined && classe != undefined) {
            metodo.helmet = helmet;
        }
        else {
            //console.log("Errore mio!");
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
            //console.log("Errore mio!");
        }
    }
}


export { decoratoreMetodo as mpMet };

export { decoratoreRitorno as mpRet };