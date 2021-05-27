
import { Router, Request, Response } from "express";

import {  TerminaleParametro } from "../classi/terminale-parametro";
import { IParametri, IParametriEstratti, TypeInterazone } from "../tools";

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
            if (richiesta.body[element.nomeParametro] != undefined) {
                tmp = richiesta.body[element.nomeParametro];
            }
            else if (richiesta.query[element.nomeParametro] != undefined) {
                tmp = richiesta.query[element.nomeParametro];
            }
            else if (richiesta.headers[element.nomeParametro] != undefined) {
                tmp = richiesta.headers[element.nomeParametro];
            }
            else {
                ritorno.nontrovato.push({
                    nomeParametro: element.nomeParametro,
                    posizioneParametro: element.indexParameter
                });
            }
            if (element.Validatore) {
                const rit = element.Validatore(tmp)
                if (rit.approvato == false) {
                    /* rit.terminale = {
                        nomeParametro: element.nomeParametro, posizione: element.posizione, tipoParametro: element.tipoParametro, descrizione: element.descrizione, sommario: element.sommario
                    } */
                    rit.terminale = element;
                    ritorno.errori.push(rit)
                }
            }
            ritorno.valoriParametri.push(tmp);
        }

        return ritorno;
    }
}