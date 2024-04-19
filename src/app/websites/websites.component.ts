import {Component, OnInit, ViewChild} from '@angular/core';

import {Website} from '../website';
import {WebsiteService} from '../website.service';
import {UtilsService} from "../utils.service";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrl: './websites.component.css'
})
export class WebsitesComponent implements OnInit {
  websites  = new MatTableDataSource<Website>();

  columnsToDisplay = ["domain", "url", "status", "registrationDate", "lastEvaluation", "Delete"];
  filters = ["Nenhum", "Por avaliar", "Em avaliação", "Avaliado", "Erro na avaliação"]
  filter = "None"
  constructor(private websiteService: WebsiteService, private utils:UtilsService, private router:Router) { }

  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.getWebsites();
  }
  ngAfterViewInit() {
    this.websites.sort = this.sort;
  }

  getWebsites(): void {
    this.websiteService.getWebsites()
      .subscribe(websites => this.websites.data = websites);
  }
  add(url: string): void {
    url = url.trim();
    if (!url) { return; }
    if (!this.utils.isValidUrl(url)) {return}
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
    return website.lastEvaluation !== undefined ? new Date(website.lastEvaluation).toLocaleString() : "Never";
  }


  filterData(filter: string) {
    this.websites.filter = filter != "Nenhum" ? filter.toLowerCase(): "";
  }
}
