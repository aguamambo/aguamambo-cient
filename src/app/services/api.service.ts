import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private API_URL = environment.API_URL;


    constructor(private http: HttpClient) {
    }

    public get<T>(url: string) {
        return this.http.get<T>(this.normalizeUrl(url));
    }
 
    public getById<T>(url: string, id: number) {
        return this.http.get<T>(this.normalizeUrl(`${url}/${id}`));
    }

    public post<T>(url: string, data: any) {
        return this.http.post<T>(this.normalizeUrl(url), data);
    }

    public put<T>(url: string, data: any) {
        return this.http.put<T>(this.normalizeUrl(url), data);
    }

    public delete<T>(url: string) {
        return this.http.delete<T>(this.normalizeUrl(url));
    }
 
    private normalizeUrl(url: string): string { 
        if (/^https?:\/\//.test(url)) {
            return url;
        }
        return `${this.API_URL}${url}`;
    }
}
