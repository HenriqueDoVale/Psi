import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Website } from './website';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class WebsiteService {
  //TODO FIX WITH REAL URL
  private webSiteURL = 'http://localhost:3000/websites';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET websites from the server */
  getWebsites(): Observable<Website[]> {
    return this.http.get<Website[]>(this.webSiteURL)
      .pipe(
        tap(_ => this.log('fetched websites')),
        catchError(this.handleError<Website[]>('getWebsites', []))
      );
  }

  /** GET website by id. Return `undefined` when id not found */
  getWebsiteNo404<Data>(id: string): Observable<Website> {
    const url = `${this.webSiteURL}/?id=${id}`;
    return this.http.get<Website[]>(url)
      .pipe(
        map(Websites => Websites[0]), // returns a {0|1} element array
        tap(w => {
          const outcome = w ? 'fetched' : 'did not find';
          this.log(`${outcome} Website id=${id}`);
        }),
        catchError(this.handleError<Website>(`getWebsite id=${id}`))
      );
  }

  /** GET website by id. Will 404 if id not found */
  getWebsite(id: string): Observable<Website> {
    const url = `${this.webSiteURL}/${id}`;
    return this.http.get<Website>(url).pipe(
      tap(_ => this.log(`fetched website id=${id}`)),
      catchError(this.handleError<Website>(`getWebsite id=${id}`))
    );
  }

  /* GET websites whose name contains search term */
  searchWebsites(term: string): Observable<Website[]> {
    if (!term.trim()) {
      // if not search term, return empty website array.
      return of([]);
    }
    return this.http.get<Website[]>(`${this.webSiteURL}/find/${term}`).pipe(
      tap(x => x.length ?
        this.log(`found websites matching "${term}"`) :
        this.log(`no websites matching "${term}"`)),
      catchError(this.handleError<Website[]>('searchWebsites', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new website to the server */
  addWebsite(url: URL): Observable<Website> {
    return this.http.post<Website>(this.webSiteURL, {url: url, domain: url.host}, this.httpOptions).pipe(
      tap((newWebsite: Website) => this.log(`added website w/ id=${newWebsite._id}`)),
      catchError(this.handleError<Website>('addWebsite'))
    );
  }

  /** DELETE: delete the website from the server */
  deleteWebsite(id: string): Observable<Website> {
    const url = `${this.webSiteURL}/${id}`;

    return this.http.delete<Website>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted website id=${id}`)),
      catchError(this.handleError<Website>('deleteWebsite'))
    );
  }

  /** PUT: update the website on the server */
  updateWebsite(website: Website): Observable<any> {
    const url = `${this.webSiteURL}/${website._id}`;

    return this.http.put(url, website, this.httpOptions).pipe(
      tap(_ => this.log(`updated website id=${website._id}`)),
      catchError(this.handleError<any>('updateWebsite'))
    );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
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

  /** Log a WebsiteService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`WebsiteService: ${message}`);
  }
}
