import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Client, ClientService} from "../client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {JsonPipe} from "@angular/common";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-client-list',
    imports: [
        FormsModule,
        JsonPipe
    ],
    templateUrl: './client-list.component.html',
    standalone: true,
    styleUrl: './client-list.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListComponent implements OnInit {
    clients: Client[] = [];
    searchTerm: string = '';

    constructor(
        private _clientService: ClientService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) {
    }

    get filteredClients(): Client[] {
        if (!this.searchTerm) {
            return this.clients;
        }
        const lowerSearch = this.searchTerm.toLowerCase();
        return this.clients.filter(client =>
            client.name.toLowerCase().includes(lowerSearch)
        );
    }

    ngOnInit(): void {
        this.loadClients();
    }

    loadClients(): void {
        this._clientService.getAllClients().subscribe((response: Client[]) => {
            this.clients = response;
            this._cdr.markForCheck();
        });
    }

    trackByFn(index: number, client: Client): any {
        return client.id || index;
    }

    openClientFormCreate(): void {
        this._router.navigate(['create'], {relativeTo: this._activatedRoute});
    }

    openClientFormEdit(id: number): void {
        this._router.navigate([`${id}/edit`], {relativeTo: this._activatedRoute});
    }

    openFormCreateUser(id: number): void {
        this
    }

    deleteClient(id: number) {
        this._clientService.deleteClient(id).subscribe({
            next: (deletedClient) => {
                this._snackBar.open("Client deleted successfully", "Close", {duration: 3000});
            },
            error: (error) => {
                this._snackBar.open("Error deleting client", "Close", {duration: 3000});
            }
        })
    }
}
