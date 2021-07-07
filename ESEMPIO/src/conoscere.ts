



import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";
import { Maggiordomo } from "./maggiordomo";
import { Persona } from "./persona";

@Entity({ name: "Conoscere" })
@mpClas({ percorso: "Conoscere" })
export class Conoscere {

    static async Istanziatore(parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) {
        const tmp = listaParametri.GetAutenticatore();
        if (tmp) {
            const validatore = <string>parametri.valoriParametri[tmp.indexParameter];
            const persona = await getRepository(Conoscere).findOne({ where: { id: validatore } });
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

    @Column({ type: "date", nullable: false /* , transformer: new EncryptionTransformer( MyEncryptionTransformerConfig) */ })
    da: Date;

    @Column({ type: "date", nullable: true/* , transformer: new EncryptionTransformer( MyEncryptionTransformerConfig) */ })
    a: Date | undefined;

    @ManyToOne(type => Persona, fkPersona => fkPersona.listaMaggiordomiConosciuti, { nullable: false, eager: true, cascade: true })
    @JoinColumn({ name: "fkPersona" })
    fkPersona: Persona;

    /** -inizio- relazione {medico - paziente} */
    @ManyToOne(type => Maggiordomo, fkMaggiordomo => fkMaggiordomo.listaPersoneConosciute, { nullable: false, eager: true })
    @JoinColumn({ name: "fkMaggiordomo" })
    fkMaggiordomo: Maggiordomo;

    constructor() {
        this.da = new Date(Date.now());
        this.fkPersona = new Persona();
        this.fkMaggiordomo = new Maggiordomo();
    }

    Salva() {
        getRepository(Conoscere).save(this);
    }

}

