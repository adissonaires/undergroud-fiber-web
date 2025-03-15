import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    set accessToken(token: string) {
        localStorage.setItem('token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('token') ?? '';
    }

    get userId(): number {
        return this.decodeTokenProperty('jti') ?? 0;
    }

    get company(): any {
        return this.decodeTokenProperty('company') ?? null;
    }

    get user(): any {
        return this.decodeToken(this.accessToken);
    }

    get isAdmin(): boolean {
        return this.user.profile.name === 'ADMINISTRATOR';
    }

    get isMaster(): boolean {
        return this.user.profile.name === 'MASTER';
    }

    private decodeTokenProperty(key: string): any {
        const tokenDecoded = AuthUtils.decodeToken(this.accessToken);
        return tokenDecoded ? tokenDecoded[key] : null;
    }

    private decodeToken(token): any {
        return AuthUtils.decodeToken(token);
    }

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }


    signIn(credentials: { email: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(`${environment.apiUrl}/authentication/login`, credentials).pipe(
            switchMap((response: any) => {
                console.log('response', response)
                this.accessToken = response.token;

                this._authenticated = true;

                this._userService.user = this.decodeToken(response.token);

                return of(response);
            })
        );
    }

    signInUsingToken(): Observable<any> {
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    of(false)
                ),
                switchMap((response: any) => {

                    if (response.token) {
                        this.accessToken = response.token;
                    }

                    this._authenticated = true;

                    this._userService.user = response.user;

                    return of(true);
                })
            );
    }

    signOut(): Observable<any> {
        localStorage.removeItem('token');

        this._authenticated = false;

        return of(true);
    }

    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        if (!this.accessToken) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        return this.signInUsingToken();
    }
}
