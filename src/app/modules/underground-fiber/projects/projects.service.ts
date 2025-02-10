import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

// Modelo do seu Project
export interface Project {
    id: number;
    name: string;
    clientId: number;
    clientName: string;
    createdAt: string;
    status: 'ACTIVE' | 'INACTIVE'; // ou string
    map: string;
    startDate: string;
    dailies: any[];
    priceCompositionTypeId: number;
    netTerm: number;
    projectCodes: any[];
    projectImages: any[];
}

/**
 * Exemplo de interface para PriceCompositionType
 */
export interface PriceCompositionType {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE'; // Ou string
}

@Injectable({ providedIn: 'root' })
export class ProjectsService
{
    private _projectsUrl = `${environment.apiUrl}/projects`;
    private _priceCompositionTypesUrl = `${environment.apiUrl}/price-composition-types`;

    constructor(private _httpClient: HttpClient) {}

    getAllProjects(): Observable<Project[]>
    {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<Project[]>(this._projectsUrl, { headers });
    }

    getPriceCompositionTypes(): Observable<PriceCompositionType[]>
    {
        // Se precisar de token
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<PriceCompositionType[]>(
            this._priceCompositionTypesUrl,
            { headers }
        );
    }
}
