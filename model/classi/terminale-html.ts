import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { IHtml, targetTerminale } from "../tools";
import { CheckClasseMetaData, GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import fs from "fs";


export { decoratoreMetodoHtml as mpMetHtml };
export { decoratoreClasseHtml as mpClasHtml };


function decoratoreMetodoHtml(parametri: IHtml): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        /* inizializzo metodo */
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        if (parametri.html != undefined || parametri.htmlPath != undefined) {
            if (parametri.html != undefined && parametri.htmlPath == undefined) {
                metodo.html = {
                    contenuto:parametri.html,
                    percorso:parametri.nome
                };
               // metodo.html?.contenuto = parametri.html;
            } else if (parametri.html == undefined && parametri.htmlPath != undefined) {
                metodo.html = {
                    contenuto:parametri.htmlPath,
                    percorso:parametri.nome
                };
                // metodo.html?.contenuto = fs.readFileSync(parametri.htmlPath).toString();
            }
            SalvaListaClasseMetaData(list);
        }
        else {
            console.log("non cìe nulla in html");
        }

    }
}

function decoratoreClasseHtml(parametri: IHtml): any {
    return (ctr: Function) => {
        const tmp: ListaTerminaleClasse = Reflect.getMetadata(ListaTerminaleClasse.nomeMetadataKeyTarget, targetTerminale);
        const classe = CheckClasseMetaData(ctr.name); 

        if (parametri.html != undefined || parametri.htmlPath != undefined) {
            if (parametri.html != undefined && parametri.htmlPath == undefined) {
                classe.html = parametri.html;
            } else if (parametri.html == undefined && parametri.htmlPath != undefined) {
                classe.html = fs.readFileSync(parametri.htmlPath).toString();
            }
            SalvaListaClasseMetaData(tmp);
        }
        else {
            console.log("non cìe nulla in html");
        }
    }
}