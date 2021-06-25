

import { Column, Entity, getRepository, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { mpMet } from "../../model/classi/terminale-metodo";
import { mpPar } from "../../model/classi/terminale-parametro";
import { mpTestClas } from "../../model/classi/terminale-test";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";
import { Conoscere } from "./conoscere";
import { Maggiordomo } from "./maggiordomo";

@mpTestClas({
    nome: "Test per testare il persona",
    testUnita: [
        {
            nome: "Primo test",
            FunzioniDaTestare: async () => {
                const t1 = new Persona();
                t1.nome = "Giacomo";
                const t2 = new Persona();
                t2.nome = "Michele";
                const t3 = new Persona();
                t3.nome = "Mattia";
                await getRepository(Persona).save(t1);
                await getRepository(Persona).save(t2);
                await getRepository(Persona).save(t3);
                return { passato: true };
            }
        }
    ]
})
@Entity({ name: "Persona" })
@mpClas("Persona")
export class Persona {

    static async Istanziatore(parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) {
        const tmp = listaParametri.GetAutenticatore();
        if (tmp) {
            const validatore = <string>parametri.valoriParametri[tmp.indexParameter];
            const persona = await getRepository(Persona).findOne({ where: { id: validatore } });
            if (persona) {
                return persona;
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
    listaMaggiordomiConosciuti: Promise<Conoscere[]> | undefined;

    constructor() {
        this.nome = 'indefinito';
    }

    @mpMet({ path: 'CambiaNome', Istanziatore: Persona.Istanziatore })
    CambiaNome(@mpPar({ nome: 'idPersona', posizione: 'query', autenticatore: true }) idPersona: string,
        @mpPar({ nome: 'nuovoNome', posizione: 'query' }) nuovoNome: string): number {
        console.log('Vecchio nome : ' + this.nome);
        this.nome = nuovoNome;
        this.Salva();
        console.log('Nuovo nome : ' + this.nome);
        return 200;
    }

    Salva() {
        getRepository(Persona).save(this);
    }

    @mpMet({ path: 'ConosceNuovoMaggiordomo', Istanziatore: Persona.Istanziatore })
    async ConosceNuovoMaggiordomo(@mpPar({ nome: 'idPersona', posizione: 'query', autenticatore: true }) idPersona: string,
        @mpPar({ nome: 'nomeMaggiordomo', posizione: 'query' }) nomeMaggiordomo: string): number {
        const maggiordomo = await getRepository(Maggiordomo).findOne({ where: { nome: nomeMaggiordomo } });
        const conoscere = new Conoscere();
        if (maggiordomo) {
            conoscere.fkMaggiordomo = maggiordomo;
            conoscere.fkPersona = this;
            (await this.listaMaggiordomiConosciuti)?.push(conoscere);
            this.Salva();
            return 200;
        }
        return 500;
    }

}

