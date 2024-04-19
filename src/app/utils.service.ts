import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  isValidUrl(url:string):boolean {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    return true;
  }
}
