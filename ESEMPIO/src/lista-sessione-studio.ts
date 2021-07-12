

import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { mpClas } from "../../model/classi/terminale-classe";
import { SessioneStudio } from "./sessione-studio";


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