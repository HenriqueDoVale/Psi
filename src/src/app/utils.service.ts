import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  isValidUrl(url:string):string {
    try {
      let urlObj = new URL(url);
      if (((urlObj.host).match( /[\s\<\>\[\]\{\}\|\\\^\%]+/g)))
        return 'unsafe'
      if (!urlObj.host.match("(?:\\.[a-zA-Z]{2,})+"))
        return 'dm'
    } catch (e) {
      if (!url.startsWith('[a-zA-Z]+\:\/\/'))
        return 'protocol'
      return 'invalid';
    }
    return 'valid';
  }
}
