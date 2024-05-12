import {Page} from "./page";

export interface Website {
  _id: string;
  url: URL;
  domain: URL;
  status: "Por avaliar" | "Em avaliação" | "Avaliado" | "Erro na avaliação";
  lastEvaluation: Date;
  registrationDate: Date;
  pages: [Page];
}
