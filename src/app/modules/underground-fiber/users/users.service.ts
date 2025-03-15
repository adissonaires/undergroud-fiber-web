import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'app/environments/environment';
import {Observable} from 'rxjs';

export interface User {
    id: number;
    name: string;
    email: string;
    profile: 'ADMINISTRATOR' | 'USER';
    companyId: number;
    status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private _usersUrl = `${environment.apiUrl}/users`;

    constructor(
        private _httpClient: HttpClient
    ) {
    }

    getAllUsers(): Observable<User[]> {
        return this._httpClient.get<User[]>(this._usersUrl);
    }

    getAllUsersByCompany(companyId): Observable<User[]> {
        return this._httpClient.get<User[]>(this._usersUrl + `/company/${companyId}`);
    }

    createUser(user: User): Observable<User> {
        return this._httpClient.post<User>(this._usersUrl, user);
    }

    updateUser(id: number, user: User): Observable<User> {
        return this._httpClient.put<User>(`${this._usersUrl}/${id}`, user);
    }
}
