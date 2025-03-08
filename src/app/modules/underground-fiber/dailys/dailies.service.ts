import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Project} from "../projects/projects.service";


export interface Dailie {
    id: number,
    map: string,
    qtyFootage: number,
    pipe: string,
    address: string,
    observation: string,
    groupName: string,
    createdAt: string,
    dateCheckIn: string,
    dateCheckOut: string,
    supervisor: string,
    qtyDrill: number,
    qtyMissil: number,
    subcontractor: string,
    projectId: number,
    projectName: string,
    dailyItems: [],
    images: [],
    statusCard: 'DOING' | 'DONE',
    status: 'ACTIVE' | 'INACTIVE',
}

@Injectable({ providedIn: 'root' })
export class DailiesService {
    constructor(
        private _httpClient: HttpClient,
    ) {
    }


    private _deiliesUrl = `${environment.apiUrl}/dailies`;
    private _uploadProjectsImageUrl = `${environment.apiUrl}/images/daily/upload`;



    getAllDeliesByProjectId(id:number): Observable<any>
    {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.get<any>(`${this._deiliesUrl}/project/${id}`, { headers });
    }

    updateDailyStatusCard(dailyId: number, statusCard: any): Observable<any> {

        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        const url = `${this._deiliesUrl}/${dailyId}/status-card`;
        return this._httpClient.put(url, statusCard, { headers });
    }

    createDaily(dailie: any): Observable<any>
    {
        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this._httpClient.post<Project>(this._deiliesUrl, dailie, { headers });
    }

    uploadDailyImages(dailyId: number, files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file, file.name);
        });
        formData.append('dailyId', dailyId.toString());

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this._httpClient.post<any>(this._uploadProjectsImageUrl, formData, { headers, responseType: 'text' as 'json'}, );
    }

}
