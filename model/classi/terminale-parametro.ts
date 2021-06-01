
import { IDescrivibile, IParametro, IPrintabile, IRitornoValidatore, targetTerminale, TipoParametro, TypeDovePossoTrovarlo, TypePosizione } from "../tools";

import express from "express";
import { CheckClasseMetaData, GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import { ListaTerminaleMetodo } from "../liste/lista-terminale-metodo";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";


export class TerminaleParametro implements IDescrivibile, IParametro {

    dovePossoTrovarlo: TypeDovePossoTrovarlo = 'rotta';
    nomeParametro: string;
    tipoParametro: TipoParametro;
    posizione: TypePosizione;
    indexParameter: number;

    descrizione: string;
    sommario: string;


    Validatore?: (parametro: any) => IRitornoValidatore;
    constructor(nomeParametro: string, tipoParametro: TipoParametro, posizione: TypePosizione, indexParameter: number) {
        this.nomeParametro = nomeParametro;
        this.tipoParametro = tipoParametro;
        this.posizione = posizione;
        this.indexParameter = indexParameter;

        this.descrizione = "";
        this.sommario = "";
    }

    /******************************* */

    
    PrintParametro() {
        return "- "+ this.tipoParametro.toString() + " : "  + this.nomeParametro + ' |';
    }
}

/**
 * 
 * @param parametri 
 *  nomeParametro: nome del parametro, in pratica il nome della variabile o un nome assonante (parlante) 
 *  posizione: la posizione rispetto alla chiamata, ovvero: "body" | "query" | "header" 
 *  tipoParametro?: fa riferimento al tipo di base, ovvero: "number" | "text" | "date" 
 *  descrizione?: descrizione lunga  
 *  sommario?: descrizione breve  
 *  dovePossoTrovarlo?: TypeDovePossoTrovarlo,
 *  Validatore?: (parametro: any) => IRitornoValidatore
 * @returns 
 */
function decoratoreParametroGenerico(parametri: IParametro)/* (nomeParametro: string, posizione: TypePosizione, tipoParametro?: TipoParametro, descrizione?: string, sommario?: string) */ {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        if (parametri.tipoParametro == undefined) parametri.tipoParametro = 'text';
        if (parametri.descrizione == undefined) parametri.descrizione = '';
        if (parametri.sommario == undefined) parametri.sommario = '';
        if (parametri.nomeParametro == undefined) parametri.nomeParametro = parameterIndex.toString();
        if (parametri.posizione == undefined) parametri.posizione = 'query';

        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        const paramestro = metodo.CercaParametroSeNoAggiungi(parametri.nomeParametro, parameterIndex,
            parametri.tipoParametro, parametri.posizione);

        if (parametri.descrizione != undefined) paramestro.descrizione = parametri.descrizione;
        else paramestro.descrizione = '';

        if (parametri.sommario != undefined) paramestro.sommario = parametri.sommario;
        else paramestro.sommario = '';

        if (parametri.dovePossoTrovarlo != undefined) paramestro.dovePossoTrovarlo = parametri.dovePossoTrovarlo;
        else paramestro.dovePossoTrovarlo = 'rotta';

        if (parametri.Validatore != undefined) paramestro.Validatore = parametri.Validatore;

        SalvaListaClasseMetaData(list);
    }
}


export { decoratoreParametroGenerico as mpPar };