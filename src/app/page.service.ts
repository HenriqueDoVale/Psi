import { Injectable } from '@angular/core';
import {Website} from "./website";
import { Observable, of } from 'rxjs';
import {catchError, tap} from "rxjs/operators";
import {Page} from "./page";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageService} from "./message.service";

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private pageURL = 'http://localhost:3000/pages';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  addPage(url: string, website: Website | undefined) {
    let validUrl = new URL (url);
    const name = validUrl.pathname != "" ? validUrl.pathname : "index";
    let page = {name: name, url:validUrl, website_id:website!._id};
    return this.http.post<Page>(this.pageURL, {name: name, url:validUrl, website_id:website!._id}, this.httpOptions).pipe(
      tap((newPage: Page) => this.log(`added page w/ id=${newPage._id}`)),
      catchError(this.handleError<Page>('addPage'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`WebsiteService: ${message}`);
  }
}
