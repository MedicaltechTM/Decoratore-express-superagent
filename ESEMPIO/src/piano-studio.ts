

import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { ListaTerminaleParametro } from "../../model/liste/lista-terminale-parametro";
import { IParametriEstratti } from "../../model/tools";

/* 
Ogni piano di studio inizia e poi viene alimentato man mano nel tempo.
Ogni piano  ha un elenco si sessini, queste si alimenteranno ad ogni sessione che puo variare nel tempo
*/
@Entity({ name: "PianoStudio" })
@mpClas({ percorso: "PianoStudio" })
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
    listaSsessioniStudio: ListaSessioneStudio[] = [];

    constructor(nomePianoStudio: string) {
        this.dataInizioStudio = new Date(Date.now());
        this.nomePianoStudio = nomePianoStudio;
    }


}
/* 

*/
@Entity({ name: "SessioneStudio" })
@mpClas({ percorso: "SessioneStudio" })
export class SessioneStudio {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: "timestamp" })
    data: Date = new Date(Date.now());
    @Column({ type: "int" })
    daPagina?: number;
    @Column({ type: "int" })
    aPagina?: number;
    @Column({ type: "varchar" })
    riassunto?: string;
    @Column({ type: "int" })
    tempoDiDurata = 0;
    @Column({ type: "varchar" })
    commentoRapido?: string;
    @Column({ type: "varchar" })
    titolo?: string;
    @Column({ type: "varchar" })
    paroleChiave?: string;

    listaPomodori?: ListaPomodori[] = [];
    /* constructor(tempoDiDurata: number) {
        this.data = new Date(Date.now());
        this.tempoDiDurata = tempoDiDurata;
    } */
}

@Entity({ name: "ListaSessioneStudio" })
@mpClas({ percorso: "ListaSessioneStudio" })
export class ListaSessioneStudio extends Array<SessioneStudio> {

    @PrimaryGeneratedColumn()
    id?: number;


    /* constructor(tempoDiDurata: number) {
        this.data = new Date(Date.now());
        this.tempoDiDurata = tempoDiDurata;
    } */

}

@Entity({ name: "ListaPomodori" })
@mpClas({ percorso: "ListaPomodori" })
export class ListaPomodori extends Array<Pomodoro> {

    @PrimaryGeneratedColumn()
    id?: number;

    AggiungiPomodoro() {
        return '';
    }
    GetNextPomodoro() {
        if (condition) {
            
        }
        return '';
    }


    /* constructor(tempoDiDurata: number) {
        this.data = new Date(Date.now());
        this.tempoDiDurata = tempoDiDurata;
    } */

}


class Pomodoro {
    tempo?: string;
    /* constructor(parameters) {
        
    } */
}

class PomodoroStudio extends Pomodoro {
    constructor() {
        super();
    }
}
class PomodoroRiposo extends Pomodoro {
    constructor() {
        super();
    }
}
class PomodoroRiassuntivo extends Pomodoro {
    constructor() {
        super();
    }
}
type TtPomodoro ={
    "b"|"a"
}