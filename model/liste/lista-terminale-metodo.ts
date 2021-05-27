import { Router } from "express";
import { TerminaleMetodo } from "../classi/terminale-metodo";
import { targetTerminale } from "../tools";

export class ListaTerminaleMetodo extends Array<TerminaleMetodo> {
    static nomeMetadataKeyTarget = "ListaTerminaleMetodo";

    constructor() {
        super();
    }
    CercaConNome(nome: string): TerminaleMetodo | undefined {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == nome) return element;
        }
        return undefined;
    }
    AggiungiElemento(item: TerminaleMetodo) {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == item.nome && element.classePath == item.classePath) {
                this[index] = item;
                return item;
            }
        }
        this.push(item);
        return item;
    }
}

export class ListaTerminaleMiddleware extends Array<TerminaleMetodo> {
    static nomeMetadataKeyTarget = "ListaTerminaleMiddleare";
    constructor() {
        super();
    }

    CercaConNomeSeNoAggiungi(nome: string) {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == nome) {
                return element;
            }
        }
        return this.AggiungiElemento(new TerminaleMetodo(nome, '', ''))

    }
    AggiungiElemento(item: TerminaleMetodo) {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == item.nome && element.classePath == item.classePath) {
                this[index] = item;
                return item;
            }
        }
        this.push(item);
        return item;
    }
}

export function GetListaMiddlewareMetaData() {
    /* let terminale = TerminaleMetodo.listaMiddleware.CercaConNomeRev(nome)

    if (terminale == undefined) {
        terminale = new TerminaleMetodo(nome, "", nome); 
        TerminaleMetodo.listaMiddleware.AggiungiElemento(terminale);
    }
    return terminale; */


    let tmp: ListaTerminaleMiddleware = Reflect.getMetadata(ListaTerminaleMiddleware.nomeMetadataKeyTarget, targetTerminale);
    if (tmp == undefined) {
        tmp = new ListaTerminaleMiddleware();
    }
    return tmp;
}


export function SalvaListaMiddlewareMetaData(tmp: ListaTerminaleMiddleware) {
    Reflect.defineMetadata(ListaTerminaleMiddleware.nomeMetadataKeyTarget, tmp, targetTerminale);
}