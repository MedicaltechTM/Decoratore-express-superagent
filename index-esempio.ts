
import chiedi from "prompts";
import { createConnection, ConnectionOptions } from "typeorm";
import { IParametriEstratti, mpMet, mpMetEvent, mpMetPropieta, mpPar } from "."; 
import { Main } from "./model/classi/terminale-main";
/* import { IReturn } from "./model/tools"; */


class Persona {
    @Controllo({
        getCheck: (valore) => {
            return true;
        },
        setCheck: (valore) => {

            return 'true';
        }
    }) nome: string;
    
    public get Nome() : string {
        console.log('ciao');
        
        return this.nome;
    }
    
    cognome: string;
    constructor() {
        this.nome = '';
        this.cognome = '';
    }

    @mpMetEvent({
        Validatore: (parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) => {
            return undefined;
        }
    })
    @mpMetPropieta({
        tipo: 'get', path: 'Saluta', risposteControllateMandatorie: true,
        RisposteDiControllo: [
            {
                trigger: 200,
                onModificaRisposta: (dati: IReturn) => {
                    return dati;
                }
            },
            {
                trigger: 400
            }
        ]
    })
    Saluta(@mpPar({
        
    }) kikko:string) {
        return 'Nome :' + this.nome + '; Cognome: ' + this.cognome + '||';
    }
}

const connessione = <ConnectionOptions>{
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: /* "password", */ "postgres",
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
}

createConnection(connessione).then(async connection => {
    console.log("ciao");
    const main = new Main('api');
    console.log("1: server express");
    console.log("2: promts-superagent");
    console.log("3: test-api");
    console.log("4: test");
    main.Inizializza("localhost", 8080, true, true);
    main.InizializzaSwagger();
    await main.StartTest();
    chiedi({ type: 'number', message: 'scegli:', name: 'risultato', min: 0, max: 3 })
        .then((result) => {
            if (result.risultato == '1') {
                console.log("Start server express.");
                main.StartExpress();
                console.log("Finito!!!!!");
            } else if (result.risultato == '2') {
                console.log("Start promt-superagent");
                main.PrintMenu();
            } else if (result.risultato == '3') {
                console.log("Start StartTestAPI");
                main.StartTestAPI();
            } else if (result.risultato == '4') {
                console.log("Start StartTest");
                main.StartTest();
            }
        }).catch((err) => {
            console.log(err);
        });

    //main.StartExpressConsole(3030, "localhost");
}).catch(err => {
    console.log(err);
})