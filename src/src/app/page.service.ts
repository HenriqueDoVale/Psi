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
  private pageURL = 'appserver.alunos.di.fc.ul.pt:3010/pages';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  addPage(url: string, childPath: string, website: string) {
    let validUrl = new URL (url);
    const name = childPath != "" ? childPath : "index";
    return this.http.post<Page>(this.pageURL, {name: name, url:validUrl, website: website}, this.httpOptions).pipe(
      tap((newPage: Page) => this.log(`added page w/ id=${newPage._id}`)),
      catchError(this.handleError<Page>('addPage'))
    );
  }

  deletePage(id: string): Observable<Page> {
    const url = `${this.pageURL}/${id}`;

    return this.http.delete<Page>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted page id=${id}`)),
      catchError(this.handleError<Page>('deletePage'))
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

