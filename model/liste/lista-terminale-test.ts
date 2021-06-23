

import { TerminaleTest } from "../classi/terminale-test";

export class ListaTerminaleTest extends Array<TerminaleTest> {
    static nomeMetadataKeyTarget = "ListaTerminaleTest";

    constructor() {
        super();
    }
    AggiungiElemento(item: TerminaleTest) {
        this.push(item);
        return item;
    }
}