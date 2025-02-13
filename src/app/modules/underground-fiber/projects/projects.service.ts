import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {User} from "../users/users.service";

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

export interface Client {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string
    status: 'ACTIVE' | 'INACTIVE'; // Ou string
}


/**
 * Exemplo de interface para TaskType
 */
export interface TaskType {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE'; // Ou string
}

@Injectable({ providedIn: 'root' })
export class ProjectsService
{
    private _projectsUrl = `${environment.apiUrl}/projects`;
    private _priceCompositionTypesUrl = `${environment.apiUrl}/price-composition-types`;
    private _TaskTypeUrl = `${environment.apiUrl}/taskTypes`;
    private _clientsUrl = `${environment.apiUrl}/clients`;
    private _uploadProjectsImageUrl = `${environment.apiUrl}/images/project/upload`;

    constructor(private _httpClient: HttpClient) {}

    getAllProjects(): Observable<Project[]>
    {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<Project[]>(this._projectsUrl, { headers });
    }

    createProject(project: Project): Observable<Project>
    {
        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.post<Project>(this._projectsUrl, project, { headers });
    }

    updateProject(id:number, project: Project): Observable<Project>
    {
        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.put<Project>(`${this._projectsUrl}/${id}`, project, { headers });
    }

    uploadProjectImages(projectId: number, files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file, file.name);
        });
        formData.append('projectId', projectId.toString());

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this._httpClient.post<any>(this._uploadProjectsImageUrl, formData, { headers, responseType: 'text' as 'json'}, );
    }

    getProjectById(id:number): Observable<Project>
    {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<Project>(`${this._projectsUrl}/${id}`, { headers });
    }

    getPriceCompositionTypes(): Observable<PriceCompositionType[]>
    {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<PriceCompositionType[]>(
            this._priceCompositionTypesUrl,
            { headers }
        );
    }

    getTaskType(): Observable<PriceCompositionType[]>
    {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<TaskType[]>(
            this._TaskTypeUrl,
            { headers }
        );
    }

    getClients(): Observable<Client[]>
    {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<Client[]>(
            this._clientsUrl,
            { headers }
        );
    }
}
