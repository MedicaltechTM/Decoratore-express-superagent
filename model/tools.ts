
import { Request, Response } from "express";
import { Risposta } from "./classi/terminale-metodo";
import { ListaTerminaleParametro } from "./liste/lista-terminale-parametro";
export const targetTerminale = { name: 'Terminale' };


export interface IPrintabile {
    PrintMenu(): any
}
export interface IDescrivibile {
    descrizione: string;
    sommario: string;
}

export type tipo = "number" | "text" | "date" | "array" | "object" | "boolean";

export interface ILogbase {
    data: Date;
    body: object;
    params: object;
    header: object;
    local: string;
    remote: string;
    url: string;
    nomeMetodo?: string
}

export function InizializzaLogbaseIn(req: Request, nomeMetodo?: string): ILogbase {

    const params = req.params;
    const body = req.body;
    const data = new Date(Date.now());
    const header = JSON.parse(JSON.stringify(req.headers));
    const local = req.socket.localAddress + " : " + req.socket.localPort;
    const remote = req.socket.remoteAddress + " : " + req.socket.remotePort;
    const url = req.originalUrl;

    /* const tmp = "Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "url : " + req.originalUrl + "\n"
        + "query : " + JSON.stringify(req.query) + "\n"
        + "body : " + JSON.stringify(req.body) + "\n"
        + "header : " + JSON.stringify(req.headers) + "\n"
        + "soket : " + "\n"
        + "local : " + req.socket.localAddress + " : " + req.socket.localPort + "\n"
        + "remote : " + req.socket.remoteAddress + " : " + req.socket.remotePort + "\n"; */

    const tmp: ILogbase = {
        params: params,
        body: body,
        data: data,
        header: header,
        local: local,
        remote: remote,
        url: url,
        nomeMetodo: nomeMetodo
    };

    return tmp;
}
export function InizializzaLogbaseOut(res: Response, nomeMetodo?: string): ILogbase {

    const params = {};
    const body = {};
    const data = new Date(Date.now());
    const header = res.getHeaders();
    const local = res.socket?.localAddress + " : " + res.socket?.localPort;
    const remote = res.socket?.remoteAddress + " : " + res.socket?.remotePort;
    const url = '';

    const tmp: ILogbase = {
        params: params,
        body: body,
        data: data,
        header: header,
        local: local,
        remote: remote,
        url: url,
        nomeMetodo: nomeMetodo
    };

    /* const tmp = "Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "headersSent : " + req.headersSent + "\n"
        + "json : " + req.json + "\n"
        + "send : " + req.send + "\n"
        + "sendDate : " + req.sendDate + "\n"
        + "statusCode : " + req.statusCode + '\n'
        + "statuMessage : " + req.statusMessage + '\n'
        + "soket : " + "\n"
        + "local : " + t1 + "\n"
        + "remote : " + t2 + "\n"; */

    return tmp;
}
export function IsJsonString(str: string): boolean {
    try {
        if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            //the json is ok 
            if (typeof str === 'object') {
                return true;
            } else {
                return false;
            }
        } else {
            //the json is not ok
            return false;
        }
    } catch (e) {
        return false;
    }
}

/**
 * @messaggio : inserisci qui il messaggio  sara incontenuto del body o del testo nel .send() di express
 * @codiceErrore inserisci qui l'errore che sara posi messo nello stato della risposta express
 * @nomeClasse inserire solo se si alla creazione ovvero nel throw new ErroreMio(....)
 * @nomeFunzione inserire solo se si alla creazione ovvero nel throw new ErroreMio(....)
 * @percorsoErrore campo gestito dala classe GestioneErrore, se proprio si vuole inserire solo se si è nella fase di rilancio di un errore
 */
export interface IErroreMio {
    messaggio: string,
    codiceErrore: number,
    nomeClasse?: string,
    nomeFunzione?: string,
    percorsoErrore?: string
}
export class ErroreMio extends Error {
    codiceErrore: number;
    percorsoErrore?: string;
    nomeClasse?: string;
    nomeFunzione?: string;
    constructor(item: IErroreMio) {
        super(item.messaggio);
        this.codiceErrore = item.codiceErrore;
        if (item.percorsoErrore) {
            this.percorsoErrore = item.percorsoErrore;
        }
        if (item.nomeClasse) {
            this.nomeClasse = item.nomeClasse;
            this.percorsoErrore = this.percorsoErrore + '_CLASSE_->' + this.nomeClasse
        }
        if (item.nomeFunzione) {
            this.nomeFunzione = item.nomeFunzione;
            this.percorsoErrore = this.percorsoErrore + '_FUNZIONE_->' + this.nomeFunzione
        }
    }
}
export interface IGestioneErrore {
    error: Error,
    nomeClasse?: string,
    nomeFunzione?: string
}
export function GestioneErrore(item: IGestioneErrore): ErroreMio {
    let errore: ErroreMio;
    const messaggio = '_CLASSE_->' + item.nomeClasse ?? '' + '_FUNZIONE_->' + item.nomeFunzione;
    if (item.error instanceof ErroreMio) {
        const tmp: ErroreMio = <ErroreMio>item.error;
        tmp.percorsoErrore = messaggio + '->' + tmp.percorsoErrore;
        errore = tmp;
    }
    else {
        errore = new ErroreMio({
            codiceErrore: 499,
            messaggio: '' + item.error,
            percorsoErrore: messaggio
        });
    }
    return errore;
}

export type TypeInterazone = "rotta" | "middleware" | 'ambo';

export interface IReturn {
    body: object | string;
    stato: number;
    nonTrovati?: INonTrovato[];
    inErrore?: IRitornoValidatore[];
    attore?: any;
}

export interface IRitornoValidatore {
    body?: object | string,
    approvato: boolean,
    stato?: number,
    messaggio: string,
    terminale?: IParametro
}

export interface IResponse {
    body: string
}

export interface IParametri {
    body: string, query: string, header: string
}
export interface INonTrovato {
    nome: string, posizioneParametro: number
}

export interface IParametriEstratti {
    valoriParametri: any[], nontrovato: INonTrovato[], errori: IRitornoValidatore[]
}


export type TypePosizione = "body" | "query" | 'header';


export type TypeDovePossoTrovarlo = TypeInterazone | "qui" | 'non-qui';

export interface IParametro {
    /** nome del parametro, in pratica il nome della variabile o un nome assonante (parlante)*/
    nome?: string,
    /** la posizione rispetto alla chiamata, ovvero: "body" | "query" | "header" */
    posizione?: TypePosizione,
    /** fa riferimento al tipo di base, ovvero: "number" | "text" | "date" */
    tipo?: tipo,
    /** descrizione lunga */
    descrizione?: string,
    /** descrizione breve */
    sommario?: string,
    /*indica se il parametro è controllato nel metodo corrente o in un 'altro metodo per esempio in un middleware */
    dovePossoTrovarlo?: TypeDovePossoTrovarlo,
    /*indica se il paramtro è un autenticatore, per esempio come un barrer token o un username, questo puo essere reperito facimente in ListaTerminaleParametro o IParametriEstratti */
    autenticatore?: boolean,

    obbligatorio?: boolean;

    Validatore?: (parametro: any) => IRitornoValidatore

    schemaSwagger?: {
        nome: string,
        valoreEsempio: string,
        tipo: string
    }[]
}

/**
 * questa interfaccia aggrega le varie parti di un percorso
 */
export interface IRaccoltaPercorsi {
    pathGlobal: string, patheader: string, porta: number
}



export type TypeMetod = "get" | "put" | "post" | "patch" | "purge" | "delete";


export interface IClasseRiferimento {
    nome: string,
    listaMiddleware?: any[]
}

/**
 * Specifica il tipo, questo puo essere: "get" | "put" | "post" | "patch" | "purge" | "delete" 
 * tipo?: TypeMetod,
 * specifica il percorso di una particolare, se non impostato prende il nome della classe 
 * path?: string,
 * l'interazione è come viene gestito il metodo, puo essere : "rotta" | "middleware" | "ambo" 
 * interazione?: TypeInterazone,
 * la descrizione è utile piu nel menu o in caso di output 
 * descrizione?: string,
 * il sommario è una versione piu semplice della descrizione 
 * sommario?: string,
 * questa è la strada per andare ad assegnare questa funzione è piu classi o sotto percorsi
 * nomiClasseRiferimento?: IClasseRiferimento[],

 * onChiamataCompletata?: (logOn: string, result: any, logIn: string) => void

 * Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;
 */
export interface IMetodo {
    swaggerClassi?: string[];
    //schemaSwagger?: any;
    /**Specifica se il percorso dato deve essere concatenato al percorso della classe o se è da prendere singolarmente di default è falso e quindi il percorso andra a sommarsi al percorso della classe */
    percorsoIndipendente?: boolean,
    /** Specifica il tipo, questo puo essere: "get" | "put" | "post" | "patch" | "purge" | "delete" */
    tipo?: TypeMetod,
    /** specifica il percorso di una particolare, se non impostato prende il nome della classe */
    path?: string,
    /** l'interazione è come viene gestito il metodo, puo essere : "rotta" | "middleware" | "ambo" */
    interazione?: TypeInterazone,
    /** la descrizione è utile piu nel menu o in caso di output */
    descrizione?: string,
    /** il sommario è una versione piu semplice della descrizione */
    sommario?: string,
    /** questa è la strada per andare ad assegnare questa funzione è piu classi o sotto percorsi
     */
    nomiClasseRiferimento?: IClasseRiferimento[],

    Risposte?: Risposta[];

    onModificaRispostaExpress?: (dati: IReturn) => IReturn
    /**
     * se impostata permette di determinare cosa succedera nel momento dell'errore
     */
    onChiamataInErrore?: (logOut: string, result: any, logIn: string, errore: any) => IReturn

    /**
     * se impostata permette di  verificare lo stato quando il metodo va a buon fine.
     */
    onChiamataCompletata?: (logOut: string, result: any, logIn: string, errore: any) => void
    onLog?: (logOut: string, result: any, logIn: string, errore: any) => void

    Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;

    onPrimaDiEseguireExpress?: (req: Request) => void


    AlPostoDi?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IReturn | any;
    Istanziatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => any;
    listaTest?: {
        /* nomeTest?:string, 
        posizione?:number,
        nomeTestGenerico?:string, */
        body: any,
        query: any,
        header: any
    }[];
    listaHtml?: IHtml[];
}

export interface IClasse {
    percorso?: string,
    LogGenerale?: any,
    /*  ((logOut: any, result: any, logIn: any, errore: any) => void) */
    Inizializzatore?: any,
    classeSwagger?: string,
    html?: IHtml[]/* ,
    listaTest?:{
        nomeTest: string,
        numeroEsecuzione: number,
        nomemetodoChiamato: string,
        risultatiAspettati: number[]
    }[]; */
}/* 
export class Html implements IHtml {

    path: string;
    percorsoIndipendente?: boolean;

    htmlPath?: string;
    html?: string;

    conenuto: string;

    constructor() {
        this.path = '';
        this.conenuto = '';
    }
}
 */
export interface IHtml {
    path: string,
    percorsoIndipendente?: boolean,

    htmlPath?: string,
    html?: string,
    contenuto:string
}

export interface IRisposta {
    stato: number,
    descrizione: string
    valori: {
        nome: string,
        tipo: tipo,
        note?: string
    }[]
}