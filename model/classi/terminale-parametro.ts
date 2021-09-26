
import { IDescrivibile, IParametro, IRitornoValidatore, tipo, TypeDovePossoTrovarlo, TypePosizione } from "../tools";

import { GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";


export class TerminaleParametro implements IDescrivibile, IParametro {
    schemaSwagger?: {
        nome: string,
        valoreEsempio: string,
        tipo: string
    }[];

    valore: any;

    dovePossoTrovarlo: TypeDovePossoTrovarlo = 'rotta';
    nome: string;
    tipo: tipo;
    posizione: TypePosizione;
    indexParameter: number;

    descrizione: string;
    sommario: string;

    autenticatore: boolean;

    obbligatorio: boolean;


    Validatore?: (parametro: any) => IRitornoValidatore;
    constructor(nome: string, tipo: tipo, posizione: TypePosizione, indexParameter: number) {
        this.nome = nome;
        this.tipo = tipo;
        this.posizione = posizione;
        this.indexParameter = indexParameter;

        this.descrizione = "";
        this.sommario = "";
        this.autenticatore = false;
        this.obbligatorio = true;
    }

    /******************************* */


    PrintParametro() {
        return "- " + this.tipo.toString() + " : " + this.nome + ' |';
    }
    PrintStruttura() {
        let tmp = '';
        tmp = tmp + "- " + this.tipo.toString() + " : " + this.nome + ' |\n';
        //tmp = tmp + '' + this. + '';
        tmp = tmp + '' + JSON.stringify(this, null, 4) + '';
        return tmp;
    }

    /*  */


    SettaSwagger() {
        const ritorno =
            `{
                "name": "${this.nome}",
                "in": "${this.posizione}",
                "required": false,
                "type": "${this.tipo}",
                "description": "${this.descrizione}",
                "summary":"${this.sommario}"
            }`;
        try {
            JSON.parse(ritorno)
        } catch (error) {
            console.log(error);
        }
        return ritorno;
    }

    Verifica(): boolean {
        try {
            switch (this.tipo) {
                case 'array':
                    this.valore = Array(this.valore);
                    break;
                case 'boolean':
                    this.valore = Boolean(this.valore);
                    break;
                case 'date':
                    this.valore = new Date(this.valore);
                    break;
                case 'number':
                    this.valore = Number(this.valore);
                    break;
                case 'object':
                    this.valore = Object(this.valore);
                    break;
                case 'text':
                    this.valore = String(this.valore);
                    break;
                case 'any': break;
                default:
                    return false;
            }
            return true;
        } catch (error) {
            console.log('ciao');
            throw error;
        }
    }
    static Verifica(tipo: tipo, valore: any): boolean {
        try {
            switch (tipo) {
                case 'array':
                    valore = Array(valore);
                    break;
                case 'boolean':
                    valore = Boolean(valore);
                    break;
                case 'date':
                    valore = new Date(valore);
                    break;
                case 'number':
                    valore = Number(valore);
                    break;
                case 'object':
                    valore = Object(valore);
                    break;
                case 'text':
                    valore = String(valore);
                    break;
                case 'any': break;
                default:
                    return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    static CostruisciTerminaleParametro(parametri: IParametro, terminale: TerminaleParametro) {

        if (terminale && parametri) {
            if (parametri.descrizione != undefined) terminale.descrizione = parametri.descrizione;
            else terminale.descrizione = '';

            if (parametri.sommario != undefined) terminale.sommario = parametri.sommario;
            else terminale.sommario = '';

            if (parametri.dovePossoTrovarlo != undefined) terminale.dovePossoTrovarlo = parametri.dovePossoTrovarlo;
            else terminale.dovePossoTrovarlo = 'rotta';

            if (parametri.schemaSwagger != undefined) terminale.schemaSwagger = parametri.schemaSwagger;

            if (parametri.Validatore != undefined) terminale.Validatore = parametri.Validatore;

            terminale.autenticatore = parametri.autenticatore ?? false;
            terminale.obbligatorio = parametri.obbligatorio ?? true;
        }
        return terminale;
    }
    static NormalizzaValori(parametri: IParametro, nomeDafault: string) {
        if (parametri.obbligatorio == undefined) parametri.obbligatorio = true;
        if (parametri.tipo == undefined) parametri.tipo = 'any';
        if (parametri.descrizione == undefined) parametri.descrizione = '';
        if (parametri.sommario == undefined) parametri.sommario = '';
        if (parametri.nome == undefined) parametri.nome = nomeDafault;
        if (parametri.posizione == undefined) parametri.posizione = 'query';
        if (parametri.autenticatore == undefined) parametri.autenticatore = false;
        return parametri;
    }
}

export class IstanzaParametro {
    constructor(parametri: IParametro, target: any, propertyKey: string | symbol, parameterIndex: number) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());

        parametri = TerminaleParametro.NormalizzaValori(parametri, parameterIndex.toString());
        const terminaleParametro = metodo.CercaParametroSeNoAggiungi(parametri.nome ?? '', parameterIndex,
            parametri.tipo ?? 'any', parametri.posizione ?? 'query');

        TerminaleParametro.CostruisciTerminaleParametro(parametri, terminaleParametro);

        SalvaListaClasseMetaData(list);
    }
}
/**
 * di default mette obbligatorio a true
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


        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());

        parametri = TerminaleParametro.NormalizzaValori(parametri, parameterIndex.toString());
        const terminaleParametro = metodo.CercaParametroSeNoAggiungi(parametri.nome ?? '', parameterIndex,
            parametri.tipo ?? 'any', parametri.posizione ?? 'query');

        TerminaleParametro.CostruisciTerminaleParametro(parametri, terminaleParametro);

        SalvaListaClasseMetaData(list);
    }
}


export { decoratoreParametroGenerico as mpPar };