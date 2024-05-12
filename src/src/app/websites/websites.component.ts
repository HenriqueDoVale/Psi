import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';

import {Website} from '../website';
import {WebsiteService} from '../website.service';
import {UtilsService} from "../utils.service";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  NgModel,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})

export class WebsitesComponent implements OnInit {
  websites  = new MatTableDataSource<Website>();
  deletionWebsite? : Website = undefined;

  columnsToDisplay = [ "url", "status", "registrationDate", "lastEvaluation", "Delete"];
  filters = ["Nenhum", "Por avaliar", "Em avaliação", "Avaliado", "Erro na avaliação"]
  filter = "Nenhum"
  constructor(private websiteService: WebsiteService,
              private utils:UtilsService,
              private router:Router,
              private formBuilder:FormBuilder,
              public dialog: MatDialog) { }

  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.getWebsites();
  }

  public formGroup = this.formBuilder.group({
    urlForm:['',[Validators.required, this.validURL()]],
  })

  get errorMessage():string {
    const error = this.formGroup.get("urlForm");
    if (error?.hasError('required'))
      return "Url não pode ser vazia";
    if (error?.hasError('protocol'))
      return "Url tem de ter protocolo, exemplo válido: https://example.com"
    if (error?.hasError('validUrl'))
      return "Url inválida, exemplo válido: https://example.com";
    if (error?.hasError('repeated'))
      return "Website já existe"
    if (error?.hasError('unsafe'))
      return "Url contém caracteres proíbidos, exemplo válido: https://example.com"
    if (error?.hasError('domain'))
      return "Domínio de topo em falta (ex:.com), exemplo válido: https://example.com"
    return "Erro";
  }

  validURL():ValidatorFn{
    return (control:AbstractControl) : ValidationErrors | null => {
      if (this.utils.isValidUrl(control.value) === 'protocol') return {protocol:true}
      if (this.utils.isValidUrl(control.value) === 'invalid') return {validUrl:true}
      if (this.utils.isValidUrl(control.value) === 'unsafe') return {unsafe:true}
      if (this.utils.isValidUrl(control.value) === 'dm') return {domain:true}

      return null;
    }
  }

  repeatedUrl():ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      if (this.websites.data.filter(w => w.url.toString().replace(new RegExp("\/$"), '') === control.value.replace(new RegExp("\/$"))).length != 0)
        return {repeated:true};
      return null;
    }
  }
  ngAfterViewInit():void {
    this.websites.sort = this.sort;
    this.websites.paginator = this.paginator;
    this.paginator._intl.firstPageLabel = "Primeira Página";
    this.paginator._intl.nextPageLabel ="Próxima";
    this.paginator._intl.lastPageLabel = "Última Página";
    this.paginator._intl.itemsPerPageLabel ="Websites Mostrados";
    this.paginator._intl.previousPageLabel ="Anterior";
  }

  getWebsites(): void {
    this.websiteService.getWebsites()
      .subscribe(websites => {this.websites.data = websites;
                                                      this.formGroup.get("urlForm")?.setValidators([Validators.required, this.validURL(), this.repeatedUrl()]);
                                                      this.formGroup.get("urlForm")?.updateValueAndValidity();
      });
  }
  add(url: string): void {
    url = url.trim();
    if (!url) { return; }
    if (this.utils.isValidUrl(url) != 'valid') {return}
    let site = new URL(url);

    this.websiteService.addWebsite(site)
      .subscribe(website => {
        this.websites.data = [...this.websites.data, website];
      });
  }

  delete(website: Website): void {
    this.websites.data = this.websites.data.filter(w => w !== website);
    this.websiteService.deleteWebsite(website._id).subscribe(() => {
      this.websites.data = this.websites.data;
    });
  }

  getDate(website: Website): string {
    return new Date(website.registrationDate).toLocaleString();
  }

  navigateTo(website:Website) {
    this.router.navigate(["detail/" + website._id]);
  }

  getLastEval(website:Website) {
    return website.lastEvaluation !== undefined ? new Date(website.lastEvaluation).toLocaleString() : "Nunca";
  }


  @ViewChild('delConf') delConf: TemplateRef<any> | undefined;
  confirmDelete(website:Website):void {

    if (website.pages.length) {
      this.deletionWebsite = website;
      this.dialog.open(this.delConf!, {data: {website:website}});
    }

    else this.delete(website);
  }



  filterData(filter: string) {
    this.websites.filter = filter != "Nenhum" ? filter.toLowerCase(): "";
  }

  isValidURL(websiteURL: HTMLInputElement) {
    return this.utils.isValidUrl(websiteURL.value) === 'valid';
  }

  protected readonly String = String;
}
