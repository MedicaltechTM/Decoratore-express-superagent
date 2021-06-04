
import { Router, Request, Response } from "express";

import {  TerminaleParametro } from "../classi/terminale-parametro";
import { IParametri, IParametriEstratti, TypeInterazone } from "../tools";

import chiedi from "prompts";

export class ListaTerminaleParametro extends Array<TerminaleParametro>  {

    constructor() {
        super();
    }

    EstraiParametriDaRequest(richiesta: Request): IParametriEstratti {
        const ritorno: IParametriEstratti = {
            errori: [], nontrovato: [], valoriParametri: []
        };
        for (let index = this.length - 1; index >= 0; index--) {
            const element = this[index];
            let tmp = undefined;
            if (richiesta.body[element.nome] != undefined && element.posizione=='body') {
                tmp = richiesta.body[element.nome];
            }
            else if (richiesta.query[element.nome] != undefined && element.posizione=='query') {
                tmp = richiesta.query[element.nome];
            }
            else if (richiesta.headers[element.nome] != undefined && element.posizione=='header') {
                tmp = richiesta.headers[element.nome];
            }
            else {
                ritorno.nontrovato.push({
                    nome: element.nome,
                    posizioneParametro: element.indexParameter
                });
            }
            if (element.Validatore) {
                const rit = element.Validatore(tmp)
                if (rit.approvato == false) {
                    /* rit.terminale = {
                        nome: element.nome, posizione: element.posizione, tipo: element.tipo, descrizione: element.descrizione, sommario: element.sommario
                    } */
                    rit.terminale = element;
                    ritorno.errori.push(rit)
                }
            }
            ritorno.valoriParametri.push(tmp);
        }

        return ritorno;
    }


    /*********************************** */

    
    async SoddisfaParamtri(chiSei: TypeInterazone): Promise<IParametri> {
        let body = '';
        let primo = false;
        console.log('Soddisfa il body:');
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.posizione == 'body' && (element.dovePossoTrovarlo == chiSei || element.dovePossoTrovarlo == 'qui')) {
                if (primo == true) {
                    body = body + ', ';
                }
                primo = true;
                const messaggio = "Nome campo :" + element.nome + "|Tipo campo :"
                    + element.tipo + 'Descrizione : ' + element.descrizione + '|Inserire valore :';
                const scelta = await chiedi({ message: messaggio, type: 'text', name: 'scelta' });
                body = body + ' "' + element.nome + '": ' + ' "' + scelta.scelta + '" ';
            }
        }
        body = body + '';

        let query = '';
        primo = false;
        console.log('Soddisfa le query:');
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.posizione == 'query' && (element.dovePossoTrovarlo == chiSei || element.dovePossoTrovarlo == 'qui')) {
                if (primo == true) {
                    query = query + ', ';
                }
                primo = true;
                const messaggio = "Nome campo :" + element.nome + "|Tipo campo :"
                    + element.tipo + 'Descrizione : ' + element.descrizione + '|Inserire valore :';
                const scelta = await chiedi({ message: messaggio, type: 'text', name: 'scelta' });
                query = query + ' "' + element.nome + '": ' + ' "' + scelta.scelta + '" ';
            }
        }
        query = query + '';


        let header = '';
        primo = false;
        console.log("Soddisfa l'header:");
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.posizione == 'header' && (element.dovePossoTrovarlo == chiSei || element.dovePossoTrovarlo == 'qui')) {
                if (index != this.length - 1 && primo == true) {
                    header = header + ', ';
                }
                primo = true;
                const messaggio = "Nome campo :" + element.nome + "|Tipo campo :"
                    + element.tipo + 'Descrizione : ' + element.descrizione + '|Inserire valore :';
                const scelta = await chiedi({ message: messaggio, type: 'text', name: 'scelta' });
                header = header + ' "' + element.nome + '": ' + ' "' + scelta.scelta + '" ';
            }
        }
        header = header + '';
        return { body, query, header };
    }
}