import { ListaTerminaleClasse } from "../liste/lista-terminale-classe";
import { IHtml, targetTerminale, TypePosizione } from "../tools";
import { CheckClasseMetaData, GetListaClasseMetaData, SalvaListaClasseMetaData } from "./terminale-classe";
import fs from "fs"; 


export { decoratoreMetodoHtml as mpMetHtml };
export { decoratoreMetodoHtmlHandlebars as mpMetHtmlHandlebars };

export { decoratoreClasseHtml as mpClasHtml };


function decoratoreMetodoHtml(parametri: IHtml): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        /* inizializzo metodo */
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());
        if (parametri.html != undefined || parametri.htmlPath != undefined) {
            if (parametri.percorsoIndipendente == undefined) parametri.percorsoIndipendente = false;

            if (parametri.html != undefined && parametri.htmlPath == undefined
                && metodo.html.find(x => { if (x.percorso == parametri.path) return true; else return false; }) == undefined) {
                metodo.html?.push({
                    contenuto: parametri.html,
                    percorso: parametri.path,
                    percorsoIndipendente: parametri.percorsoIndipendente
                });
                // metodo.html?.contenuto = parametri.html;
            } else if (parametri.html == undefined && parametri.htmlPath != undefined
                && metodo.html.find(x => { if (x.percorso == parametri.path) return true; else return false; }) == undefined) {
                metodo.html.push({
                    contenuto: fs.readFileSync(parametri.htmlPath).toString(),
                    percorso: parametri.path,
                    percorsoIndipendente: parametri.percorsoIndipendente
                });
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


/* 
percorso: string, contenuto: string, percorsoIndipendente?: boolean,
        listaParametri:{nome:string, valore:string}[]
*/
function decoratoreMetodoHtmlHandlebars(parametri: {
    trigger?: { nome: string, valre: any, posizione: TypePosizione },
    risposta: {
        "2xx"?: {
            htmlPath?: string,
            html?: string
        },
        "1xx"?: {
            htmlPath?: string,
            html?: string
        },
        "3xx"?: {
            htmlPath?: string,
            html?: string
        },
        "4xx"?: {
            htmlPath?: string,
            html?: string
        },
        "5xx"?: {
            htmlPath?: string,
            html?: string
        }
    }
}): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const list: ListaTerminaleClasse = GetListaClasseMetaData();
        /* inizializzo metodo */
        const classe = list.CercaConNomeSeNoAggiungi(target.constructor.name);
        const metodo = classe.CercaMetodoSeNoAggiungiMetodo(propertyKey.toString());


        if (parametri)
            metodo.RispondiConHTML = parametri;
        /* if (parametri.html != undefined || parametri.htmlPath != undefined) {
            if (parametri.percorsoIndipendente == undefined) parametri.percorsoIndipendente = false;

            if (parametri.html != undefined && parametri.htmlPath == undefined
                && metodo.html.find(x => { if (x.percorso == parametri.path) return true; else return false; }) == undefined) {

                const source = parametri.html;
                const template = Handlebars.compile(source);

                const data = variabili;//await metodo.Esegui();// .ChiamataGenerica(req, res);//variabili;
                const result = template(data);

                metodo.html?.push({
                    contenuto: result,//parametri.html,
                    percorso: parametri.path,
                    percorsoIndipendente: parametri.percorsoIndipendente
                });

                metodo.htmlHandlebars
                // metodo.html?.contenuto = parametri.html;
            } else if (parametri.html == undefined && parametri.htmlPath != undefined
                && metodo.html.find(x => { if (x.percorso == parametri.path) return true; else return false; }) == undefined) {

                const source = fs.readFileSync(parametri.htmlPath).toString();
                const template = Handlebars.compile(source);

                const data = variabili;
                const result = template(data);

                metodo.html.push({
                    contenuto: result,//fs.readFileSync(parametri.htmlPath).toString(),
                    percorso: parametri.path,
                    percorsoIndipendente: parametri.percorsoIndipendente
                });
                // metodo.html?.contenuto = fs.readFileSync(parametri.htmlPath).toString();
            } */
        SalvaListaClasseMetaData(list);
        /* }
        else {
            console.log("non cìe nulla in html");
        } */

    }
}