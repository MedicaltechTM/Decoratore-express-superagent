
import { Column, Entity, getRepository, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
//import { mpMetHtml, mpMetHtmlHandlebars } from "../../model/classi/terminale-html";
import { mpMet } from "../../model/classi/terminale-metodo";
import { mpPar } from "../../model/classi/terminale-parametro";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";
import { Conoscere } from "./conoscere";

/* @mpTestClas({
    nome: "Test per testare il maggiordomo",
    testUnita: [
        {
            nome: "Primo test",
            FunzioniDaTestare: async () => {
                const t1 = new Maggiordomo();
                t1.nome = "Giacomo";
                const t2 = new Maggiordomo();
                t2.nome = "Michele";
                const t3 = new Maggiordomo();
                t3.nome = "Mattia";
                await getRepository(Maggiordomo).save(t1);
                await getRepository(Maggiordomo).save(t2);
                await getRepository(Maggiordomo).save(t3);
                return { passato: true };
            }
        }
    ]
}) */
@Entity({ name: "Maggiordomo" })
@mpClas("Maggiordomo")
export class Maggiordomo {

    static async Istanziatore(parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) {
        const tmp = listaParametri.GetAutenticatore();
        if (tmp) {
            const validatore = <string>parametri.valoriParametri[tmp.indexParameter];
            const maggiordomo = await getRepository(Maggiordomo).findOne({ where: { id: validatore } });
            if (maggiordomo) {
                return maggiordomo;
            }
            throw new Error("Non trovato");
            //throw new ErroreMio({ codiceErrore: 400, messaggio: 'errore cosi', nomeClasse: 'Paziente', nomeFunzione: 'GetPazienteValidato' });

        } else {
            throw new Error("Non sei autenticato!!!");
        }
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: "varchar"/* , nullable: false, unique: true */ /* , transformer: new EncryptionTransformer( MyEncryptionTransformerConfig) */ })
    nome = "";

    @OneToMany(type => Conoscere, conoscere => conoscere.fkMaggiordomo)
    @JoinColumn({ name: "listaPersoneConosciute" })
    listaPersoneConosciute: Promise<Conoscere[]> | undefined;

    constructor() {
        this.nome = 'indefinito';
    }

    /* @mpMetHtmlHandlebars({
        risposta: {
            "2xx": {
                html: `
                    <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Document</title>
                        </head>

                        <body>
                            <h1>Ciao dal medico !!!</h1>
                            <p>{{saluto}}</p>
                        </body>

                        </html>
                    `
            }
        }
    })
    @mpMetHtml({ path: 'MaggiordomoSaluta.html', htmlPath: 'ESEMPIO/html/MaggiordomoSaluta.html', percorsoIndipendente: false })
    @mpMetHtml({ path: 'MaggiordomoSaluta2.html', htmlPath: 'ESEMPIO/html/MaggiordomoSaluta.html', percorsoIndipendente: false }) */
    @mpMet({
        path: 'MaggiordomoSaluta', Istanziatore: Maggiordomo.Istanziatore, tipo: 'get',
        listaTest: [
            {
                body: {},
                header: {},
                query: { "idMaggiordomo": '1' }
            }
        ],
        listaHtml: [
            { path: 'MaggiordomoSaluta.html', htmlPath: 'ESEMPIO/html/MaggiordomoSaluta.html', percorsoIndipendente: false },
            { path: 'MaggiordomoSaluta2.html', htmlPath: 'ESEMPIO/html/MaggiordomoSaluta.html', percorsoIndipendente: true }
        ],
        RispondiConHTML: {
            /* trigger: {
                nome: 'trigger', posizione: 'query', valre: 'true'
            }, */
            risposta: {
                "2xx": {
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Document</title>
                        </head>

                        <body>
                            <h1>Ciao dal medico !!!</h1>
                            <p>{{saluto}}</p>
                            
                            <button onclick="this.innerHTML=Date()">cliccami, che ore sono? :</button>
                        </body>

                        </html>
                        `
                }
            }
        },
        Risposte: [
            {
                stato: 200,
                descrizione: 'ciao',
                valori: [
                    {
                        nome: "saluto",
                        tipo: "text"
                    }
                ]
            }
        ]
    })
    MaggiordomoSaluta(@mpPar({ nome: 'idMaggiordomo', posizione: 'query', autenticatore: true }) idMaggiordomo: string): any {
        console.log("Sono il maggiordomo : " + this.nome);
        return { saluto: "Sono il maggiordomo : " + this.nome };
    }

    @mpMet({ path: 'MaggiordomoSalutaChi' })
    MaggiordomoSalutaChi(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string): any {
        console.log("Buon giorno signor : " + nome);
        return "Buon giorno signor : " + nome;
    }

}

