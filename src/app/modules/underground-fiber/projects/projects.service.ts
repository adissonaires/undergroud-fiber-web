import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";

export interface Project {
    id: number;
    name: string;
    clientId: number;
    clientName: string;
    createdAt: string;
    status: 'ACTIVE' | 'INACTIVE';
    map: string;
    startDate: string;
    dailies: any[];
    priceCompositionTypeId: number;
    netTerm: number;
    projectCodes: any[];
    projectImages: any[];
}

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


export interface TaskType {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE'; // Ou string
}

@Injectable({providedIn: 'root'})
export class ProjectsService {
    private _projectsUrl = `${environment.apiUrl}/projects`;
    private _priceCompositionTypesUrl = `${environment.apiUrl}/price-composition-types`;
    private _TaskTypeUrl = `${environment.apiUrl}/taskTypes`;
    private _clientsUrl = `${environment.apiUrl}/clients`;
    private _uploadProjectsImageUrl = `${environment.apiUrl}/images/project/upload`;

    constructor(private _httpClient: HttpClient) {
    }

    getAllProjects(): Observable<Project[]> {
        return this._httpClient.get<Project[]>(this._projectsUrl);
    }

    createProject(project: Project): Observable<Project> {
        return this._httpClient.post<Project>(this._projectsUrl, project);
    }

    updateProject(id: number, project: Project): Observable<Project> {
        return this._httpClient.put<Project>(`${this._projectsUrl}/${id}`, project);
    }

    uploadProjectImages(projectId: number, files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file, file.name);
        });
        formData.append('projectId', projectId.toString());

        return this._httpClient.post<any>(this._uploadProjectsImageUrl, formData, {responseType: 'text' as 'json'},);
    }

    getProjectById(id: number): Observable<Project> {
        return this._httpClient.get<Project>(`${this._projectsUrl}/${id}`);
    }

    getPriceCompositionTypes(): Observable<PriceCompositionType[]> {
        return this._httpClient.get<PriceCompositionType[]>(
            this._priceCompositionTypesUrl
        );
    }

    getTaskType(): Observable<PriceCompositionType[]> {
        return this._httpClient.get<TaskType[]>(
            this._TaskTypeUrl
        );
    }

    getClients(): Observable<Client[]> {
        return this._httpClient.get<Client[]>(
            this._clientsUrl
        );
    }
}
