import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";

export interface Company {
    id: number;
    name: string;
    address: number;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({providedIn: 'root'})
export class CompanyService {
    private _companiesUrl = `${environment.apiUrl}/companies`;

    constructor(private _httpClient: HttpClient) {
    }

    getAllCompanies(): Observable<Company[]> {
        return this._httpClient.get<Company[]>(this._companiesUrl);
    }

    createCompany(project: Company): Observable<Company> {
        return this._httpClient.post<Company>(this._companiesUrl, project);
    }

    updateCompany(id: number, project: Company): Observable<Company> {
        return this._httpClient.put<Company>(`${this._companiesUrl}/${id}`, project);
    }

    deleteCompany(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this._companiesUrl}/${id}`);
    }

    getCompanyById(id: number): Observable<Company> {
        return this._httpClient.get<Company>(`${this._companiesUrl}/${id}`);
    }
}
