
import { Request, Response } from "express";
import { ListaTerminaleParametro } from "./liste/lista-terminale-parametro";
export var targetTerminale = { name: 'Terminale' };

export interface IPrintabile {
    PrintMenu(): any
}
export interface IDescrivibile {
    descrizione: string;
    sommario: string;
}

export type TipoParametro = "number" | "text" | "date";

export function InizializzaLogbaseIn(req: Request, nomeMetodo?: string): string {
    /* console.log("InizializzaLogbaseIn - Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "url : " + req.originalUrl + "\n"
        + "query : " + JSON.stringify(req.query) + "\n"
        + "body : " + JSON.stringify(req.body) + "\n"
        + "header : " + JSON.stringify(req.headers) + "\n"
        + "soket : " + "\n"
        + "local : " + req.socket.localAddress + " : " + req.socket.localPort + "\n"
        + "remote : " + req.socket.remoteAddress + " : " + req.socket.remotePort + "\n"
    ); */

    const body = req.body;
    const data = new Date(Date.now());
    const header = JSON.parse(JSON.stringify(req.headers));
    const local = req.socket.localAddress + " : " + req.socket.localPort;
    const remote = req.socket.remoteAddress + " : " + req.socket.remotePort;
    const url = req.originalUrl;

    const tmp = "Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "url : " + req.originalUrl + "\n"
        + "query : " + JSON.stringify(req.query) + "\n"
        + "body : " + JSON.stringify(req.body) + "\n"
        + "header : " + JSON.stringify(req.headers) + "\n"
        + "soket : " + "\n"
        + "local : " + req.socket.localAddress + " : " + req.socket.localPort + "\n"
        + "remote : " + req.socket.remoteAddress + " : " + req.socket.remotePort + "\n";
    return tmp;
}
export function InizializzaLogbaseOut(req: Response, nomeMetodo?: string): string {

    var t1 = '', t2 = '';
    if (req.socket != undefined) {
        t1 = req.socket.localAddress + " : " + req.socket.localPort;
        t2 = req.socket.remoteAddress + " : " + req.socket.remotePort;
    }
    /* console.log("InizializzaLogbaseOut - Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "headersSent : " + req.headersSent + "\n"
        // + "json : " + req.json + "\n"
        // + "send : " + req.send + "\n"
        + "sendDate : " + req.sendDate + "\n"
        + "statusCode : " + req.statusCode + '\n'
        + "statuMessage : " + req.statusMessage + '\n'
        + "soket : " + "\n"
        + "local : " + t1 + "\n"
        + "remote : " + t2 + "\n"
    ); */


    const tmp = "Arrivato in : " + nomeMetodo + "\n"
        + "Data : " + new Date(Date.now()) + "\n"
        + "headersSent : " + req.headersSent + "\n"
        + "json : " + req.json + "\n"
        + "send : " + req.send + "\n"
        + "sendDate : " + req.sendDate + "\n"
        + "statusCode : " + req.statusCode + '\n'
        + "statuMessage : " + req.statusMessage + '\n'
        + "soket : " + "\n"
        + "local : " + t1 + "\n"
        + "remote : " + t2 + "\n";
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
export class ErroreMio extends Error {
    codiceErrore: number = 500;
    percorsoErrore;
    constructor(messaggio: string, codiceErrore: number, nomeErrore: string, percorsoErrore: string) {
        super(messaggio);
        this.codiceErrore = codiceErrore;
        this.name = nomeErrore != undefined ? nomeErrore : "ErroreGenerico";
        this.percorsoErrore = percorsoErrore;
    }
}


export type TypeInterazone = "rotta" | "middleware" | 'ambo';

export interface IReturn {
    body: object | string;
    stato: number;
    nonTrovati?: INonTrovato[];
    inErrore?: IRitornoValidatore[];
}
export interface IResponse {
    body: string
}

export interface IParametri {
    body: string, query: string, header: string
}
export interface INonTrovato {
    nomeParametro: string, posizioneParametro: number
}

export interface IParametriEstratti {
    valoriParametri: any[], nontrovato: INonTrovato[], errori: IRitornoValidatore[]
}

export function GestioneErrore(error: Error, nomeClasse: string): ErroreMio {
    console.log(error);
    let errore: ErroreMio;
    if (error.name === "ErroreMio" || error.name === "ErroreGenerico") {
        //throw new ErroreMio("Errore : " + error, 500, "CalcolaPasswordCriptata");

        const testo = ""
        var tmp: ErroreMio = <ErroreMio>error;
        tmp.percorsoErrore = ' :: ' + "Errore_" + testo + "Class_" + nomeClasse + ' -> ' + tmp.percorsoErrore;
        errore = tmp;
    }
    else {
        console.log(error);
        const testo = "Errore di rilancio."
        errore = new ErroreMio(testo, 499, "ErroreMio", "Errore_" + testo + "Class_" + nomeClasse);
    }
    return errore;
}

export type TypePosizione = "body" | "query" | 'header';


export type TypeDovePossoTrovarlo = TypeInterazone | "qui" | 'non-qui';

export interface IParametro {
    /** nome del parametro, in pratica il nome della variabile o un nome assonante (parlante)*/
    nomeParametro?: string,
    /** la posizione rispetto alla chiamata, ovvero: "body" | "query" | "header" */
    posizione?: TypePosizione,
    /** fa riferimento al tipo di base, ovvero: "number" | "text" | "date" */
    tipoParametro?: TipoParametro,
    /** descrizione lunga */
    descrizione?: string,
    /** descrizione breve */
    sommario?: string,
    dovePossoTrovarlo?: TypeDovePossoTrovarlo,
    Validatore?: (parametro: any) => IRitornoValidatore
}

/**
 * questa interfaccia aggrega le varie parti di un percorso
 */
export interface IRaccoltaPercorsi {
    pathGlobal: string, patheader: string, porta: number
}



export type TypeMetod = "get" | "put" | "post" | "patch" | "purge" | "delete";

export interface IRitornoValidatore {
    approvato: boolean,
    stato: number,
    messaggio: string,
    terminale?: IParametro
}

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

    onChiamataCompletata?: (logOn: string, result: any, logIn: string) => void

    Validatore?: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => IRitornoValidatore;
}