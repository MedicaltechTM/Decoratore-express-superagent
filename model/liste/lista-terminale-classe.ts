import { SalvaListaClasseMetaData, TerminaleClasse } from "../classi/terminale-classe";
import fs from 'fs';

export class ListaTerminaleClasse extends Array<TerminaleClasse> {
    static nomeMetadataKeyTarget = "ListaTerminaleClasse";

    constructor() {
        super();
    }
    
    CercaConNome(nome: string | Symbol): TerminaleClasse | undefined {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == nome) return element;
        }
        return undefined;
        //throw new Error("Errore mio !");

    }
    CercaConPath(path: string | Symbol): TerminaleClasse | undefined {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.GetPath == path) return element;
        }
        return undefined;
        //throw new Error("Errore mio !");

    }
    CercaConNomeSeNoAggiungi(nome: string) {
        /* poi la cerco */
        let classe = this.CercaConNome(nome);
        if (classe == undefined) {
            classe = new TerminaleClasse(nome); //se il metodo non c'è lo creo
            this.AggiungiElemento(classe);
            SalvaListaClasseMetaData(this);
        }
        return classe;
    }
    CercaMetodo() {

    }
    AggiungiElemento(item: TerminaleClasse) {
        for (let index = 0; index < this.length; index++) {
            const element = this[index];
            if (element.nome == item.nome) {
                this[index] = item;
                return item;
            }
        }
        this.push(item);
        return item;
    }
}