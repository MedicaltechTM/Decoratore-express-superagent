import { IRaccoltaPercorsi, targetTerminale } from "../tools";


import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { ListaTerminaleMetodo } from "../liste/lista-terminale-metodo";
import { TerminaleMetodo } from "./terminale-metodo";

import chiedi from "prompts";
import { Router } from "express";

export class TerminaleClasse {
    html?: string;

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
    }

    SettaPathRoot_e_Global(item: string, percorsi: IRaccoltaPercorsi, app: any) {

        if (percorsi.patheader == undefined) this.percorsi.patheader = "localhost";
        else this.percorsi.patheader = percorsi.patheader;

        if (percorsi.porta == undefined) this.percorsi.porta = 3000;
        else this.percorsi.porta = percorsi.porta;

        const pathGlobal = percorsi.pathGlobal + '/' + this.path;
        this.percorsi.pathGlobal = pathGlobal;
        for (let index = 0; index < this.listaMetodi.length; index++) {
            const element = this.listaMetodi[index];
            if (element.tipoInterazione == 'rotta' || element.tipoInterazione == 'ambo') {
                //element.ConfiguraRotta(this.rotte, this.percorsi);
                element.ConfiguraRottaApplicazione(app, this.percorsi);
            }
            //element.listaRotteGeneraChiavi=this.listaMetodiGeneraKey;
        }
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
            console.log(ritorno);
        }
        return ritorno;
        /* const swaggerJson = ``;
        let ritorno = '';
        let primo = false;
        for (let index = 0; index < this.listaMetodi.length; index++) {
            const element = this.listaMetodi[index];
            if (element.tipoInterazione != 'middleware') {
                const tt = element.SettaSwagger('rotta');
                if (tt) {
                    if (primo == false && tt != undefined) {
                        primo = true;
                        ritorno = tt + '';
                    } else if (tt != undefined) {
                        ritorno = ritorno + ',' + tt;
                    }
                }
            }
        }
        const tmp = swaggerJson + ritorno + '}';

        try {
            const hhh = tmp.toString();
            JSON.parse(tmp)
        } catch (error) {
            console.log(error);
        }
        return tmp; */
    }

}

/**
 * inizializza la classe, crea un rotta in express mediante il percorso specificato. 
 * @param percorso : di default il nome della classe
 */
function decoratoreClasse(percorso?: string, LogGenerale?: any/*  ((logOut: any, result: any, logIn: any, errore: any) => void) */, Inizializzatore?: any): any {
    return (ctr: Function) => {
        const tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        const classe = CheckClasseMetaData(ctr.name);
        if (percorso) classe.SetPath = percorso;
        else classe.SetPath = ctr.name;
        if (LogGenerale) {
            classe.listaMetodi.forEach(element => {
                if (element.onChiamataCompletata == undefined)
                    element.onChiamataCompletata = LogGenerale;
            });
        }
        if (Inizializzatore) {
            classe.listaMetodi.forEach(element => {
                let contiene = false;
                element.listaParametri.forEach(element => {
                    if (element.autenticatore == true) contiene = true;
                });
                if (contiene) element.Istanziatore = Inizializzatore;
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