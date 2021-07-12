

import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";
import { ListaSessioneStudio } from "./lista-sessione-studio";

@Entity({ name: "PianoStudio" })
@mpClas({ percorso: "PianoStudio",html:[
    {
        path:'home.html',
        html:'',
        percorsoIndipendente:false,
        contenuto:''
    }
] })
export class PianoStudio {

    static async Istanziatore(parametri: IParametriEstratti, listaParametri: ListaTerminaleParametro) {
        const tmp = listaParametri.GetAutenticatore();
        if (tmp) {
            const validatore = <string>parametri.valoriParametri[tmp.indexParameter];
            const persona = await getRepository(PianoStudio).findOne({ where: { id: validatore } });
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

    @Column({ type: "timestamp" })
    dataInizioStudio: Date = new Date(Date.now());

    @Column({ type: "timestamp" })
    dataFineStudio: Date | undefined = undefined;

    @Column({ type: "varchar" })
    nomePianoStudio = "";

    //@OneToMany(type => ListaSessioneStudio, conoscere => conoscere.id)
    @OneToOne(() => ListaSessioneStudio)
    @JoinColumn({ name: "listaSessioneStudio" })
    sessioniStudio: ListaSessioneStudio[] = [];

    constructor(nomePianoStudio: string) {
        this.dataInizioStudio = new Date(Date.now());
        this.nomePianoStudio = nomePianoStudio;
    }


}


