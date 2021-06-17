
import { IDescrivibile, IParametro,  IRitornoValidatore,  tipo, TypeDovePossoTrovarlo, TypePosizione } from "../tools";

import {  GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";


export class TerminaleParametro implements IDescrivibile, IParametro {

    valore: any;

    dovePossoTrovarlo: TypeDovePossoTrovarlo = 'rotta';
    nome: string;
    tipo: tipo;
    posizione: TypePosizione;
    indexParameter: number;

    descrizione: string;
    sommario: string;

    autenticatore: boolean;


    Validatore?: (parametro: any) => IRitornoValidatore;
    constructor(nome: string, tipo: tipo, posizione: TypePosizione, indexParameter: number) {
        this.nome = nome;
        this.tipo = tipo;
        this.posizione = posizione;
        this.indexParameter = indexParameter;

        this.descrizione = "";
        this.sommario = "";
        this.autenticatore = false;
    }

    /******************************* */


    PrintParametro() {
        return "- " + this.tipo.toString() + " : " + this.nome + ' |';
    }
}

/**
 * 
 * @param parametri 
 *  nome: nome del parametro, in pratica il nome della variabile o un nome assonante (parlante) 
 *  posizione: la posizione rispetto alla chiamata, ovvero: "body" | "query" | "header" 
 *  tipo?: fa riferimento al tipo di base, ovvero: "number" | "text" | "date" 
 *  descrizione?: descrizione lunga  
 *  sommario?: descrizione breve  
 *  dovePossoTrovarlo?: TypeDovePossoTrovarlo,
 *  Validatore?: (parametro: any) => IRitornoValidatore
 * @returns 
 */
function decoratoreParametroGenerico(parametri: IParametro)/* (nome: string, posizione: TypePosizione, tipo?: tipo, descrizione?: string, sommario?: string) */ {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        if (parametri.tipo == undefined) parametri.tipo = 'text';
        if (parametri.descrizione == undefined) parametri.descrizione = '';
        if (parametri.sommario == undefined) parametri.sommario = '';
        if (parametri.nome == undefined) parametri.nome = parameterIndex.toString();
        if (parametri.posizione == undefined) parametri.posizione = 'query';
        if (parametri.autenticatore == undefined) parametri.autenticatore = false;

        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        const paramestro = metodo.CercaParametroSeNoAggiungi(parametri.nome, parameterIndex,
            parametri.tipo, parametri.posizione);

        if (parametri.descrizione != undefined) paramestro.descrizione = parametri.descrizione;
        else paramestro.descrizione = '';

        if (parametri.sommario != undefined) paramestro.sommario = parametri.sommario;
        else paramestro.sommario = '';

        if (parametri.dovePossoTrovarlo != undefined) paramestro.dovePossoTrovarlo = parametri.dovePossoTrovarlo;
        else paramestro.dovePossoTrovarlo = 'rotta';

        if (parametri.Validatore != undefined) paramestro.Validatore = parametri.Validatore;

        paramestro.autenticatore = parametri.autenticatore;

        SalvaListaClasseMetaData(list);
    }
}


export { decoratoreParametroGenerico as mpPar };