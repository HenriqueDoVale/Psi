import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {Website} from "../website";
import {Page} from "../page";
import {WebsiteService} from "../website.service";
import {PageService} from "../page.service";
import {MatTableDataSource} from "@angular/material/table";
import {UtilsService} from "../utils.service";
@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrl: './website-detail.component.css'
})
export class WebsiteDetailComponent {
  website: Website | undefined;
  pages  = new MatTableDataSource<Page>();
  columnsToDisplay = ["Name", "URL", "Status", "LastEval"];

  constructor(
    private utils: UtilsService,
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location,
    private pageService: PageService
  ) {}

  ngOnInit(): void {
    this.getWebsite();
  }

  getWebsite(): void {
    const id = (this.route.snapshot.paramMap.get('id'));
    if (id != null) {
      this.websiteService.getWebsite(id)
        .subscribe(hero => {this.website = hero;
                                                  this.pages.data=this.website.pages});
    }
  }

  addPage(url:string):void {
    url = url.trim();


    if (!url) { return; }
    if (this.utils.isValidUrl(url)) {
      if (new URL(url).hostname === new URL(this.website!.url).hostname) {
        this.pageService.addPage(url, this.website).subscribe(page => {this.pages.data = [...this.pages.data, page];
                                                                                            this.website?.pages.push(page);
                                                                                            this.websiteService.updateWebsite(this.website!).subscribe()});
      }
    }
}

  save(): void {
    if (this.website) {
      this.websiteService.updateWebsite(this.website)
        .subscribe(() => this.goBack());
    }
  }

  getEvalDate(page:Page):string {
    if (page.lastEvaluation === undefined) {
      return "None"
    }
    else return new Date(page.lastEvaluation).toLocaleString();
  }

  goBack(): void {
    this.location.back();
  }
}
