import {Website} from "./website";

export interface Page {
  _id: string;
  name: string;
  url: URL;
  pageStatus?: "Conforme" | "Não Conforme" | "Não Avaliado"
  lastEvaluation?: Date;
  website: Website;
}
