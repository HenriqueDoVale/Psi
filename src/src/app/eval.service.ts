import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageService} from "./message.service";
import {Page} from "./page";
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EvalService {
  private evalURL = 'appserver.alunos.di.fc.ul.pt:3010/evaluate';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  evaluate(id:string) {
    const url = `${this.evalURL}/${id}`;
    return this.http.get<Page>(url).pipe(tap(_=>this.log(`Evaluating page with id = ${id}`)),
      catchError(this.handleError<any>('evaluate')))
  }

    private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error); // log to console instead

      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`WebsiteService: ${message}`);
  }
}
