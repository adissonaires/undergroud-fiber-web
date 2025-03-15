import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";

export interface Client {
    id: number;
    name: string;
    address: number;
    email: string;
    phone: string;
    companyId: number;
    status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({providedIn: 'root'})
export class ClientService {
    private _clientsUrl = `${environment.apiUrl}/clients`;

    constructor(private _httpClient: HttpClient) {
    }

    getAllClients(): Observable<Client[]> {
        return this._httpClient.get<Client[]>(this._clientsUrl);
    }

    getAllClientsByCompany(companyId): Observable<Client[]> {
        return this._httpClient.get<Client[]>(this._clientsUrl + `/company/${companyId}`);
    }

    createClient(project: Client): Observable<Client> {
        return this._httpClient.post<Client>(this._clientsUrl, project);
    }

    updateClient(id: number, project: Client): Observable<Client> {
        return this._httpClient.put<Client>(`${this._clientsUrl}/${id}`, project);
    }

    deleteClient(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this._clientsUrl}/${id}`);
    }

    getClientById(id: number): Observable<Client> {
        return this._httpClient.get<Client>(`${this._clientsUrl}/${id}`);
    }
}
