import { Main } from "./model/classi/terminale-main";
import { mpClas } from "./model/classi/terminale-classe";
import { mpMet, mpMetEvent } from "./model/classi/terminale-metodo";
import { mpPar } from "./model/classi/terminale-parametro";
import { mpTestClas, mpTestMet } from "./model/classi/terminale-test";
import { mpMetHtml } from './model/classi/terminale-html';

/* import { mpLog } from "./model/classi/terminale-log"; */
import { ErroreMio, IRitornoValidatore, GestioneErrore, IParametriEstratti, ILogbase } from "./model/tools";
import { ListaTerminaleParametro } from './model/liste/lista-terminale-parametro';

import "reflect-metadata";

export { Main as Main };
export { mpMet as mpMet };
export { mpMetEvent as mpMetEvent };
/* export { mpMetProprita as mpMetPropieta }; */

export { mpPar as mpPar };
export { mpClas as mpClas };

export { mpTestClas as mpTestClas };
export { mpTestMet as mpTestMet };
export { mpMetHtml as mpMetHtml };

/* export { mpLog as mpLog } */

export { ErroreMio as ErroreMio };
export { IRitornoValidatore as IRitornoValidatore };
export { GestioneErrore as GestioneErrore };

export { IParametriEstratti as IParametriEstratti };
export { ListaTerminaleParametro as ListaTerminaleParametro };

export { ILogbase as ILogbase };

