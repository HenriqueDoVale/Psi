import {Website} from "./website";
import {Test} from "./test";

export interface Page {
  _id: string;
  name: string;
  url: URL;
  pageStatus?: "Conforme" | "Não Conforme" | "Por avaliar" | "Em avaliação" | "Erro na avaliação"
  lastEvaluation?: Date;
  website: Website;
  report: string;
  tests: [Test];
  forEval: boolean;
  forRemoval: boolean
}
