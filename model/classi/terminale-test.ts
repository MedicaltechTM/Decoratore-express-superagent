
import { ListaTerminaleTest } from "../liste/lista-terminale-test";
import { targetTerminale } from "../tools";



export class TerminaleTest {

    static nomeMetadataKeyTarget = "MetodoTerminaleTarget";

    listaTest?: ITest;
    constructor(item: any) {
        this.listaTest = item;
    }
}
function decoratoreTestClasse(parametri: ITest): any {
    return (ctr: Function) => {
        const tmp: ListaTerminaleTest = GetListaTestMetaData();
        tmp.AggiungiElemento(new TerminaleTest(parametri.testUnita));
        SalvaListaTerminaleMetaData(tmp);
    }
}
function decoratoreTestMetodo(parametri: ITest) {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const tmp: ListaTerminaleTest = GetListaTestMetaData();
        tmp.AggiungiElemento(new TerminaleTest(parametri.testUnita));
        SalvaListaTerminaleMetaData(tmp);

    }
}

export interface ITest {
    /**Specifica se il percorso dato deve essere concatenato al percorso della classe o se è da prendere singolarmente di default è falso e quindi il percorso andra a sommarsi al percorso della classe */
    testUnita: {
        FunzioniCreaAmbienteEsecuzione?: () => IReturnTest,
        FunzioniDaTestare: () => IReturnTest,
        FunzioniDiPulizia?: () => IReturnTest
    }[]
}
export interface IReturnTest {
    passato: boolean
}
/**
 * 
 * @returns 
 */
export function GetListaTestMetaData(): ListaTerminaleTest {
    let tmp: ListaTerminaleTest = Reflect.getMetadata(ListaTerminaleTest.nomeMetadataKeyTarget, targetTerminale);
    if (tmp == undefined) {
        tmp = new ListaTerminaleTest();
    }
    return tmp;
}

/**
 * 
 * @param tmp 
 */
export function SalvaListaTerminaleMetaData(tmp: ListaTerminaleTest) {
    Reflect.defineMetadata(ListaTerminaleTest.nomeMetadataKeyTarget, tmp, targetTerminale);
}


export { decoratoreTestClasse as mpTestClas };
export { decoratoreTestMetodo as mpTestMet };