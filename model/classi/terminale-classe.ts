import { IClasse, IRaccoltaPercorsi, targetTerminale, IHtml } from "../tools";


import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { ListaTerminaleMetodo } from "../liste/lista-terminale-metodo";
import { TerminaleMetodo } from "./terminale-metodo";

import chiedi from "prompts";
import { Request, Router, Response } from "express";
import fs from 'fs';

export class TerminaleClasse {

    classeSwagger?= '';

    static nomeMetadataKeyTarget = "ClasseTerminaleTarget";

    listaMetodi: ListaTerminaleMetodo;
    id: string;
    nome: string;
    rotte: Router;

    private path: string;
    public get GetPath(): string {
        return this.path;
    }
    public set SetPath(v: string) {
        this.path = v;
        const pathGlobal = '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
    }

    percorsi: IRaccoltaPercorsi;

    /* listaTest: {
        nomeTest: string,
        numeroEsecuzione: number,
        nomemetodoChiamato: string,
        risultatiAspettati: number[]
    }[] = []; */

    html: IHtml[] = [];

    constructor(nome: string, path?: string, headerPath?: string, port?: number) {
        this.id = Math.random().toString();
        this.rotte = Router();
        this.listaMetodi = new ListaTerminaleMetodo();

        this.nome = nome;
        if (path) this.path = path;
        else this.path = nome;
        this.percorsi = { pathGlobal: '', patheader: '', porta: 0 };

        if (headerPath == undefined) this.percorsi.patheader = "http://localhost:";
        else this.percorsi.patheader = headerPath;
        if (port == undefined) this.percorsi.porta = 3000;
        else this.percorsi.porta = port;

        const pathGlobal = '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
        this.classeSwagger = '';
    }

    SettaPathRoot_e_Global(item: string, percorsi: IRaccoltaPercorsi, app: any) {
        const pathGlobal = this.SettaPercorsi(percorsi);
        this.ConfiguraListaRotteHTML(app, pathGlobal);
        this.listaMetodi.ConfiguraListaRotteApplicazione(app, this.percorsi);
    }
    SettaPercorsi(percorsi: IRaccoltaPercorsi): string {
        if (percorsi.patheader == undefined) this.percorsi.patheader = "localhost";
        else this.percorsi.patheader = percorsi.patheader;

        if (percorsi.porta == undefined) this.percorsi.porta = 3000;
        else this.percorsi.porta = percorsi.porta;

        const pathGlobal = percorsi.pathGlobal + '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
        return pathGlobal;
    }

    CercaMetodoSeNoAggiungiMetodo(nome: string) {
        let terminale = this.listaMetodi.CercaConNome(nome)

        if (terminale == undefined)/* se non c'è */ {
            terminale = new TerminaleMetodo(nome, nome, this.nome); // creo la funzione
            this.listaMetodi.AggiungiElemento(terminale);
        }
        return terminale;
    }

    /******************************************************************* */

    async PrintMenuClasse() {
        console.log('Classe :' + this.nome);
        for (let index = 0; index < this.listaMetodi.length; index++) {
            const element = this.listaMetodi[index];
            const tmp = index + 1;
            if (element.tipoInterazione == 'rotta' || element.tipoInterazione == 'ambo') {
                console.log(tmp + ': ' + element.PrintStamp());
            }
        }
        const scelta = await chiedi({ message: 'Scegli il metodo da eseguire: ', type: 'number', name: 'scelta' });

        if (scelta.scelta == 0) {
            console.log("Saluti dalla classe : " + this.nome);

        } else {
            try {
                console.log('Richiamo la rotta');
                const risposta = await this.listaMetodi[scelta.scelta - 1].ChiamaLaRotta(this.percorsi.patheader + this.percorsi.porta);
                if (risposta == undefined) {
                    console.log("Risposta undefined!");
                } else {
                    console.log(risposta)
                }
            } catch (error) {
                console.log(error);
            }
            await this.PrintMenuClasse();
        }
    }


    SettaSwagger() {
        /* 
        "paths": {  } 
        */
        let ritorno = '';
        for (let index = 0; index < this.listaMetodi.length; index++) {
            const element = this.listaMetodi[index];
            const tmp = element.SettaSwagger();
            if (index > 0 && tmp != undefined)
                ritorno = ritorno + ', ';
            if (tmp != undefined)
                ritorno = ritorno + tmp;
        }
        return ritorno;
    }

    ConfiguraRotteHtml(app: any, percorsoTmp: string, contenuto: string) {
        app.get(percorsoTmp,
            //this.cors,
            //this.helmet,
            async (req: Request, res: Response) => {
                if (this.html)
                    res.send(contenuto);
                else
                    res.sendStatus(404);
            });
    }
    ConfiguraListaRotteHTML(app: any, pathGlobal: string) {
        for (let index = 0; index < this.html.length; index++) {
            const element = this.html[index];
            //element.ConfiguraRotteHtml(app, this.percorsi.pathGlobal,)
            if (element.percorsoIndipendente)
                this.ConfiguraRotteHtml(app, '/' + element.path, element.contenuto);
            else
                this.ConfiguraRotteHtml(app, pathGlobal + '/' + element.path, element.contenuto);
        }
    }

}

/**
 * inizializza la classe, crea un rotta in express mediante il percorso specificato. 
 * @param percorso : di default il nome della classe
 */
function decoratoreClasse(parametri: IClasse): any {
    return (ctr: Function) => {
        const tmp: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = CheckClasseMetaData(ctr.name);
        /* 
                if (parametri.listaTest) classe.listaTest = parametri.listaTest; */

        if (parametri.percorso) classe.SetPath = parametri.percorso;
        else classe.SetPath = ctr.name;

        if (parametri.html) {
            classe.html = [];
            for (let index = 0; index < parametri.html.length; index++) {
                const element = parametri.html[index];
                if (element.percorsoIndipendente == undefined) element.percorsoIndipendente = false;

                if (element.html != undefined && element.htmlPath == undefined
                    && classe.html.find(x => { if (x.path == element.path) return true; else return false; }) == undefined) {
                    classe.html.push({
                        contenuto: element.html,
                        path: element.path,
                        percorsoIndipendente: element.percorsoIndipendente
                    });
                    // metodo.html?.contenuto = element.html;
                } else if (element.html == undefined && element.htmlPath != undefined
                    && classe.html.find(x => { if (x.path == element.path) return true; else return false; }) == undefined) {

                    try {
                        classe.html.push({
                            contenuto: fs.readFileSync(element.htmlPath).toString(),
                            path: element.path,
                            percorsoIndipendente: element.percorsoIndipendente
                        });
                    } catch (error) {
                        classe.html.push({
                            contenuto: 'Nessun contenuto',
                            path: element.path,
                            percorsoIndipendente: element.percorsoIndipendente
                        });
                    }
                    // metodo.html?.contenuto = fs.readFileSync(element.htmlPath).toString();
                }
            }
        }

        if (parametri.LogGenerale) {
            classe.listaMetodi.forEach(element => {
                if (element.onLog == undefined)
                    element.onLog = parametri.LogGenerale;
            });
        }

        if (parametri.Inizializzatore) {
            classe.listaMetodi.forEach(element => {
                let contiene = false;
                element.listaParametri.forEach(element => {
                    if (element.autenticatore == true) contiene = true;
                });
                if (contiene) element.Istanziatore = parametri.Inizializzatore;
            });
        }

        if (parametri.classeSwagger && parametri.classeSwagger != '') {
            classe.classeSwagger = parametri.classeSwagger;
            classe.listaMetodi.forEach(element => {
                if (element.swaggerClassi) {
                    const ris = element.swaggerClassi.find(x => { if (x == parametri.classeSwagger) return true; else return false; })
                    if (ris == undefined && parametri.classeSwagger) {
                        element.swaggerClassi.push(parametri.classeSwagger);
                    }
                }
            });
        }

        SalvaListaClasseMetaData(tmp);
    }
}

/**
 * 
 * @param nome 
 * @returns 
 */
export function CheckClasseMetaData(nome: string) {
    let listClasse: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale); // vado a prendere la struttura legata alle funzioni ovvero le classi
    if (listClasse == undefined)/* se non c'è la creo*/ {
        listClasse = new ListaTerminaleClasse();
        Reflect.defineMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, listClasse, targetTerminale);
    }
    /* poi la cerco */
    let classe = listClasse.CercaConNome(nome);
    if (classe == undefined) {
        classe = new TerminaleClasse(nome); //se il metodo non c'è lo creo
        listClasse.AggiungiElemento(classe);
        Reflect.defineMetadata(TerminaleClasse.nomeMetadataKeyTarget, classe, targetTerminale); //e lo vado a salvare nel meta data
    }
    return classe;
}

/**
 * 
 * @param tmp 
 */
export function SalvaListaClasseMetaData(tmp: ListaTerminaleClasse) {
    Reflect.defineMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, tmp, targetTerminale);
}

/**
 * 
 * @returns 
 */
export function GetListaClasseMetaData() {
    let tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
    if (tmp == undefined) {
        tmp = new ListaTerminaleClasse();
    }
    return tmp;
}

export { decoratoreClasse as mpClas };