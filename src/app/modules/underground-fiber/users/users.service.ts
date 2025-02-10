import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'app/environments/environment';
import { Observable } from 'rxjs';

// Interface para tipar o retorno (ajuste conforme sua modelagem no backend)
export interface User {
    id: number;
    name: string;
    email: string;
    profile: 'ADMINISTRATOR' | 'USER';
    status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({
    providedIn: 'root'
})
export class UsersService
{
    // Monta a URL base a partir do environment
    private _usersUrl = `${environment.apiUrl}/users`;

    /**
     * Construtor
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
    }

    /**
     * Buscar todos os usuários
     */
    getAllUsers(): Observable<User[]>
    {
        const token = localStorage.getItem('token');

        // Monta os headers manualmente
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        // Faz a requisição GET adicionando os headers
        return this._httpClient.get<User[]>(this._usersUrl, { headers });
    }


    createUser(user: User): Observable<User>
    {
        const token = localStorage.getItem('token');

        // Monta os headers manualmente
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.post<User>(this._usersUrl, user, { headers });
    }



    updateUser(id: number, user: User): Observable<User>
    {
        const token = localStorage.getItem('token');

        // Monta os headers manualmente
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.put<User>(`${this._usersUrl}/${id}`, user, { headers });
    }
}
