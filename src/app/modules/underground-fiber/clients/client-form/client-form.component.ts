import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {Client, ClientService} from "../client.service";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {Company, CompanyService} from "../../companies/company.service";

@Component({
    selector: 'client-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatSnackBarModule,
    ],
    templateUrl: './client-form.component.html',
    styleUrls: ['./client-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFormComponent implements OnInit {
    clientForm: FormGroup;

    isEditMode: boolean = false;
    clientId!: number;

    companies: Company[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Construtor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _clientService: ClientService,
        private _companyService: CompanyService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar
    ) {
    }

    ngOnInit(): void {
        this.loadCompanies();
        this.createClientForm();

        this._route.paramMap.subscribe(params => {
            const id = params.get('clientId');
            if (id) {
                this.isEditMode = true;
                this.clientId = Number(id);

                this._clientService.getClientById(this.clientId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(client => {

                        this.clientForm.patchValue({
                            name: client.name,
                            address: client.address,
                            email: client.email,
                            phone: client.phone,
                            companyId: client.companyId,
                            status: client.status
                        });

                        this._cdr.markForCheck();
                    });
            }
        });
    }

    private createClientForm(): void {
        this.clientForm = this._formBuilder.group({
            name: [''],
            address: [''],
            email: [''],
            phone: [''],
            companyId: [''],
            status: [''],
        });
    }

    /**
     * Destrói subscriptions para evitar leaks
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createClient(): void {
        const formValues = this.clientForm.value;

        const payload: Client = {
            id: null,
            name: formValues.name,
            address: formValues.address,
            email: formValues.email,
            phone: formValues.phone,
            companyId: formValues.companyId,
            status: formValues.status
        };


        if (this.isEditMode) {
            this._clientService.updateClient(this.clientId, payload)
                .subscribe({
                    next: (updatedClient) => {
                        this._snackBar.open("Client updated successfully", "Close", {duration: 3000});
                        this._router.navigateByUrl("/clients");
                    },
                    error: (error) => {
                        this._snackBar.open("Error updating client", "Close", {duration: 3000});
                    }
                });
        } else {
            this._clientService.createClient(payload)
                .subscribe({
                    next: (createdClient) => {
                        this._snackBar.open("Client created successfully", "Close", {duration: 3000});
                        this._router.navigateByUrl("/clients");
                    },
                    error: (error) => {
                        this._snackBar.open("Error creating client", "Close", {duration: 3000});
                    }
                });
        }
    }

    loadCompanies(): void
    {
        this._companyService.getAllCompanies().subscribe((response: Company[]) => {
            this.companies = response;
            this._cdr.markForCheck();
        });
    }

    trackByObj(index: number, obj: any): number {
        return obj.id;
    }
}


