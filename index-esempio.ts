
import chiedi from "prompts";
import { createConnection, ConnectionOptions } from "typeorm";
import { Main } from "./model/classi/terminale-main";


const connessione = <ConnectionOptions>{
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
}

createConnection(connessione).then(async connection => {
    console.log("ciao");
    const main = new Main('api');
    console.log("1: server express");
    console.log("2: promts-superagent");
    console.log("3: test-api");
    console.log("4: test");
    main.Inizializza("localhost", 8080, true, true);
    main.InizializzaHandlebars();
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