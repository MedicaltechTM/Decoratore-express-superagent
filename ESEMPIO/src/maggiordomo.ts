import { Column, Entity, getRepository, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { mpMet } from "../../model/classi/terminale-metodo";
import { mpPar } from "../../model/classi/terminale-parametro";
import { mpTestClas } from "../../model/classi/terminale-test";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";

@mpTestClas({
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
})
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

    constructor() {
        this.nome = 'indefinito';
    }

    @mpMet({ path: 'MaggiordomoSaluta', Istanziatore: Maggiordomo.Istanziatore, listaTest:[{
        body:{},
        header:{},
        query:{"idMaggiordomo":'1'}
    }] })
    MaggiordomoSaluta(@mpPar({ nome: 'idMaggiordomo', posizione: 'query', autenticatore: true }) idMaggiordomo: string) {
        console.log("Sono il maggiordomo : " + this.nome);
        return { saluto: "Sono il maggiordomo : " + this.nome };
    }
    @mpMet({ path: 'MaggiordomoSalutaChi' })
    MaggiordomoSalutaChi(@mpPar({ nome: 'nome', posizione: 'query' }) nome: string) {
        console.log("Buon giorno signor : " + nome);
        return "Buon giorno signor : " + nome;
    }

}

