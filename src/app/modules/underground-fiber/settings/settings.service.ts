import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";
import {Company} from "../companies/company.service";

export interface Settings {
    company: Company
}

export interface SettingsAccount {
    address: string
    email: string
    name: string
    phone: string
    profile: string
    status: string
    userId: number
    company: Company
}

@Injectable({providedIn: 'root'})
export class SettingsService {
    private _settingsUrl = `${environment.apiUrl}/settings`;

    constructor(private _httpClient: HttpClient) {
    }

    getSettingsByCompanyId(companyId: number): Observable<Settings> {
        return this._httpClient.get<Settings>(`${this._settingsUrl}/${companyId}`);
    }

    getAccountByUserId(userId: number): Observable<SettingsAccount> {
        return this._httpClient.get<SettingsAccount>(`${this._settingsUrl}/account/${userId}`);
    }
}
