import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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
}
