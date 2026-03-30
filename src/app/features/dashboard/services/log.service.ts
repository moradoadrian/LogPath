import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PosEvent } from '../dashboard.component'; 

@Injectable({
  providedIn: 'root'
})
export class LogService {
  // ¡API en la nube de CubePath!
  private apiUrl = 'http://logpath-logpathapi-jstq8p-c92805-108-165-47-114.traefik.me/api/logs';

  constructor(private http: HttpClient) { }

  getLogs(): Observable<PosEvent[]> {
    return this.http.get<PosEvent[]>(this.apiUrl);
  }
  createLog(logData: any): Observable<any> {
    return this.http.post(this.apiUrl, logData);
  }
}