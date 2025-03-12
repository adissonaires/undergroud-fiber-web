import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);

    private _user: any;

    set user(value: any)
    {
        this._user = value;
    }

    get user(): any
    {
        return this._user;
    }

    resetPassword(idUsuario: string, password: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/users/${idUsuario}/password`, password);
    }
}
