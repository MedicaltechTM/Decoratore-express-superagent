

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";


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
    tempoDiDurata=0;
    @Column({ type: "varchar" })
    commentoRapido?: string;
    @Column({ type: "varchar" })
    titolo?: string;
    @Column({ type: "varchar" })
    paroleChiave?: string;

    /* constructor(tempoDiDurata: number) {
        this.data = new Date(Date.now());
        this.tempoDiDurata = tempoDiDurata;
    } */

}