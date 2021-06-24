import { Main } from "./model/classi/terminale-main";
import { mpClas } from "./model/classi/terminale-classe";
import { mpMet } from "./model/classi/terminale-metodo";
import { mpPar } from "./model/classi/terminale-parametro";
import chiedi from "prompts";
import { mpTestClas, mpTestMet } from "./model/classi/terminale-test";

/* import { mpLog } from "./model/classi/terminale-log"; */
import { ErroreMio, IRitornoValidatore, GestioneErrore, IParametriEstratti, ILogbase } from "./model/tools";
import { ListaTerminaleParametro } from './model/liste/lista-terminale-parametro';

import "reflect-metadata";
import { createConnection } from "typeorm";

export { Main as Main };
export { mpMet as mpMet };
export { mpPar as mpPar };
export { mpClas as mpClas };

export { mpTestClas as mpTestClas };
export { mpTestMet as mpTestMet };
/* export { mpLog as mpLog } */

export { ErroreMio as ErroreMio };
export { IRitornoValidatore as IRitornoValidatore };
export { GestioneErrore as GestioneErrore };

export { IParametriEstratti as IParametriEstratti };
export { ListaTerminaleParametro as ListaTerminaleParametro };

export { ILogbase as ILogbase };

createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",//"testStaisicuro",
    synchronize: true,
    logging: false,
    entities: [
        "ESEMPIO/src/**/*.ts"
    ],
    migrations: [
        "ESEMPIO/src/migration/**/*.ts"
    ],
    subscribers: [
        "ESEMPIO/src/subscriber/**/*.ts"
    ],
    cli: {
        "entitiesDir": "ESEMPIO/src/app",
        "migrationsDir": "ESEMPIO/src",
        "subscribersDir": "ESEMPIO/src"
    }
}).then(async connection => {
    console.log("ciao");
    const main = new Main('api');
    console.log("1: server express");
    console.log("2: promts-superagent");
    main.Inizializza("localhost", 3030, true, true);
    await main.StartTest();
    chiedi({ type: 'number', message: 'scegli:', name: 'risultato', min: 0, max: 2 })
        .then((result) => {
            if (result.risultato == '1') {
                console.log("Start server express.");
                main.StartExpress();
                console.log("Finito!!!!!");
            } else if (result.risultato == '2') {
                console.log("Start promt-superagent");
                main.PrintMenu();
            }
        }).catch((err) => {
            console.log(err);
        });

    //main.StartExpressConsole(3030, "localhost");
}).catch(err => {
    console.log(err);
})

/* @mpClas()
class ClassUno {

    @mpMet({ interazione: 'middleware' })
    middleClasseUno(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string) {
        console.log('Hei sono la classe uno, hai il nome: ' + nome);
        return true;
    }
    Ciao() {
        console.log("Primo");
    }
    @mpMet({ nomiClasseRiferimento: [{ nome: 'ClassDue', listaMiddleware: ['middleClasseDue', 'middleClasseUno'] }] })
    @mpAddMiddle('middleClasseUno')
    MetodoPrimo(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string) {
        this.Ciao();
        return 'metodo primo ciao, sei : ' + nome;
    }
}


@mpClas()
class ClassDue {
    @mpMet({ interazione: 'middleware' })
    middleClasseDue(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string) {
        console.log('Hei sono la classe due, hai il nome: ' + nome);
        return true;
    }
} */


/* export function Foo(funcToCallEveryTime: (...args: any[]) => void) {
    return (target: any, key: string, descriptor: any) => {
        var originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            funcToCallEveryTime(...args);
            return originalMethod.apply(this, args);
        }

        return descriptor;
    }
}

*/



/* function Ciao(nome:string) {
    console.log("Primo ciao");
    console.log("nome :::: "+nome);

}
@mpClas()
class ClassUno {
    static CiaoDue() {
        console.log("Secondo ciao");

    }

    @mpMet({tipo:'post'})
    MetodoPrimo(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string) {
        try {
            Ciao(nome);
        } catch (error) {
            console.log(error);
        }

        return 'metodo primo ciao, sei : ' + nome;
    }

}
try {
    const classe: ClassUno = new ClassUno();
    const main = new Main('app');

    main.Inizializza("http://localhost", 3030, true, true);
    main.StartExpress();
    main.PrintMenu();
    console.log("Finito!!!");

} catch (error) {
    console.log(error);
    console.log("Finito!!!");
}
*/


/*
function name() {
    try {
        console.log("inizio");
        //throw new ErroreMio({ codiceErrore: 200, messaggio: '', percorsoErrore: '' });

        throw new Error("Buuuuu");


    } catch (error) {
        console.log(__dirname);
        console.log(__filename);
        const tmp = GestioneErrore(error, 'classe')
        console.log(tmp);
    }

}

name();  */