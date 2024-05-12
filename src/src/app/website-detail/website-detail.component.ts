import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {Website} from "../website";
import {Page} from "../page";
import {WebsiteService} from "../website.service";
import {EvalService} from "../eval.service";
import {PageService} from "../page.service";
import {MatTableDataSource} from "@angular/material/table";
import {UtilsService} from "../utils.service";
import {MatSort} from "@angular/material/sort";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {filter, forkJoin, Observable} from "rxjs";

@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrls: ['./website-detail.component.css']
})
export class WebsiteDetailComponent {
  website: Website | undefined;
  noErrors: number = 0;
  errors: number = 0;
  errorsA: number = 0;
  errorsAA: number = 0;
  errorsAAA: number = 0;
  websiteErrors: [string, {name:string, occurences: number}] [] = []
  //websiteErrors: Map<string, {name:string, occurences: number}> = new Map();
  pages  = new MatTableDataSource<Page>();
  columnsToDisplay = ["name", "url", "pageStatus", "lastEvaluation", "eval", "Delete"];
  filters = ["Nenhum", "Conforme", "Não Conforme" , "Por avaliar", "Em avaliação", "Erro na avaliação"];

  constructor(
    private utils: UtilsService,
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location,
    private pageService: PageService,
    private formBuilder: FormBuilder,
    private evalService: EvalService
  ) {}

  public formGroup :FormGroup = this.formBuilder.group({
    urlForm:['',Validators.required],
  })

  validURL():ValidatorFn{
    return (control:AbstractControl) : ValidationErrors | null => {
      if (this.utils.isValidUrl(control.value) === 'protocol') return {validUrl:true}
      if (this.utils.isValidUrl(control.value) === 'invalid') return {validUrl:true}
      return null;
    }
  }

  belongsToDomain(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      return !control.value.startsWith(this.website!.url.toString()) ? {child:true} : null;
    }
  }

  get errorMessage():string {
    const error = this.formGroup.get("urlForm");
    if (error?.hasError('required'))
      return "Url não pode ser vazia";
    if (error?.hasError('validUrl'))
      return "Url inválida, exemplo válido: " +this.website!.url.toString() + "detail";
    if (error?.hasError('protocol'))
      return "Url tem de ter protocolo (ex: https://)"
    if (error?.hasError('child'))
      return "Url tem de pertencer a " + this.website?.url.toString();
    if (error?.hasError("repeated"))
      return "Página já existe"
    return "Erro na URL";
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  ngOnInit(): void {
    Promise.all([this.getWebsite()]).then(() => {
      this.formGroup.get("urlForm")!.setValidators([Validators.required, this.validURL(),this.belongsToDomain(), this.repeatedUrl()]);
      this.formGroup.get("urlForm")?.updateValueAndValidity();
    })
  }

  repeatedUrl():ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      if (this.pages.data.filter(p => p.url.toString().replace(new RegExp("\/$"), '') === control.value.replace(new RegExp("\/$"))).length != 0)
        return {repeated:true};
      return null;
    }
  }

  hasEval(): boolean {
    return this.pages.data.some(page => page.forEval)
  }

  hasDel(): boolean {
    return this.pages.data.some(page => page.forRemoval)
  }

  getWebsite(): void {
    const id = (this.route.snapshot.paramMap.get('id'));
    if (id != null) {
      this.websiteService.getWebsite(id)
        .subscribe(website => {this.website = website;
          this.pages.data=this.website.pages
          this.pages.sort = this.sort
          this.pages.paginator = this.paginator;
          this.paginator._intl.firstPageLabel = "Primeira Página";
          this.paginator._intl.nextPageLabel ="Próxima";
          this.paginator._intl.lastPageLabel = "Última Página";
          this.paginator._intl.itemsPerPageLabel ="Páginas Mostradas";
          this.paginator._intl.previousPageLabel ="Anterior";
          this.getStatistics()
          this.getTopMistakes();
        });
    }
  }

  addPage(url:string):void {
    url = url.trim();

    if (!url) { return; }
    if (this.utils.isValidUrl(url) === 'valid') {
      if (url.startsWith(this.website!.url.toString())) {
        const childPath = url.replace(this.website!.url.toString(), "")
        this.pageService.addPage(url, childPath, this.website!._id).subscribe(page => {this.pages.data = [...this.pages.data, page];
          this.website?.pages.push(page);
          this.pages.data = this.pages.data;
          this.websiteService.updateWebsite(this.website!).subscribe(wb => {this.website = wb})});
      }
    }
  }

  evaluate() {
    let evalPages = this.pages.data.filter(x => {return x.forEval});
    if (this.website!.status !== "Erro na avaliação")
      this.website!.status = "Em avaliação";
    for (const page of evalPages!) {
        page.forEval = false;
        page.forRemoval = false;
        let index = this.pages.data.indexOf(page);
        page.pageStatus = "Em avaliação";
        this.evalService.evaluate(page._id).subscribe(page => {
          this.pages.data[index] = page;
          this.pages.data = this.pages.data;
          this.getStatistics();
          this.getTopMistakes();
          this.websiteService.getWebsite(this.website!._id)
            .subscribe(website => {this.website = website});
        });
    }
  }

  getTopMistakes() {
    this.websiteErrors = []
    let websiteErrors = new Map()
    for (const page of this.pages.data.filter(x =>{return x.pageStatus === "Conforme" || x.pageStatus === "Não Conforme"})) {
      for (const test of page.tests.filter(x=>{return x.failed >= 1})) {
        let occ = test.failed;
        if (websiteErrors.has(test.code)) occ += websiteErrors.get(test.code)!.occurences;
        websiteErrors.set(test.code,{name: test.name, occurences: occ})
      }
    }

    this.websiteErrors = [...websiteErrors.entries()].sort((a,b) => b[1].occurences - a[1].occurences).slice(0,10);

  }
  save(): void {
    if (this.website) {
      this.websiteService.updateWebsite(this.website)
        .subscribe(() => this.goBack());
    }
  }

  getStatistics(): void {
    this.errorsA = 0;
    this.errorsAA = 0;
    this.errorsAAA = 0;
    this.noErrors = 0;
    this.errors = 0;

    for (const page of this.pages.data) {

      if (page.pageStatus == "Conforme" || page.pageStatus == "Não Conforme") {
        let a = page.tests.some(test => {
          return test.A && test.failed > 0
        })

        let aa = page.tests.some(test => {
          return test.AA && test.failed > 0
        })

        let aaa = page.tests.some(test => {
          return test.AAA && test.failed > 0
        })

        if (a || aa || aaa) this.errors++;
        else this.noErrors++;
        if (a) this.errorsA++;
        if (aa) this.errorsAA++;
        if (aaa) this.errorsAAA++;
      }
    }
  }

  getEvalDate(page:Page):string {
    if (page.lastEvaluation === undefined) {
      return "Nunca"
    }
    else return new Date(page.lastEvaluation).toLocaleString();
  }

  goBack(): void {
    this.location.back();
  }

  filterData(value: string) {
    this.pages.filterPredicate = function(page:Page, value:String) {
      return page.pageStatus!.trim().toLowerCase() === value.trim().toLowerCase();
    }
    this.pages.filter = value !== "Nenhum" ? value : "";
  }

  getDate(website: Website): string {
    return new Date(website.registrationDate).toLocaleString();
  }

  getLastEval(website:Website) {
    return website.lastEvaluation !== undefined || website.lastEvaluation === null ? new Date(website.lastEvaluation).toLocaleString() : "Nunca";
  }

  delete(): void {
    let observables : Observable<any>[] = [];
    for (const page of this.pages.data.filter(p => p.forRemoval)) {
      observables.push(this.pageService.deletePage(page._id));
      forkJoin(observables).subscribe(() =>{
        this.getWebsite();
      });
      this.pages.data = this.pages.data.filter(p => !p.forRemoval);

    }
  }

    protected readonly Math = Math;
}

