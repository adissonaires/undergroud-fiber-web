import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {Company, CompanyService} from "../company.service";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxMaskDirective, NgxMaskPipe, provideNgxMask} from "ngx-mask";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";

@Component({
    selector: 'company-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatSnackBarModule,
        NgxMaskDirective,
        NgxMaskPipe,
    ],
    providers: [provideNgxMask()],
    templateUrl: './company-form.component.html',
    styleUrls: ['./company-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyFormComponent implements OnInit {
    companyForm: FormGroup;

    isEditMode: boolean = false;
    companyId!: number;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Construtor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _companyService: CompanyService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

    ngOnInit(): void {
        this.createCompanyForm();

        this._route.paramMap.subscribe(params => {
            const id = params.get('companyId');
            if (id) {
                this.isEditMode = true;
                this.companyId = Number(id);

                this._companyService.getCompanyById(this.companyId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(company => {

                        this.companyForm.patchValue({
                            name: company.name,
                            address: company.address,
                            email: company.email,
                            phone: company.phone,
                            status: company.status
                        });

                        this._cdr.markForCheck();
                    });
            }
        });
    }

    private createCompanyForm(): void {
        this.companyForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            address: ['', [Validators.required]],
            email: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            status: ['', [Validators.required]],
        });
    }

    /**
     * Destrói subscriptions para evitar leaks
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createCompany(): void {
        if (this.companyForm.invalid) {
            this.companyForm.markAllAsTouched();

            this._fuseConfirmationService.open({
                title: 'Required fields missing',
                message: 'Please fill out all required fields before saving.',
                actions: {
                    confirm: { label: 'OK', color: 'primary' },
                    cancel: { show: false }
                },
                dismissible: true
            });
            return;
        }
        const formValues = this.companyForm.value;

        const payload: Company = {
            id: null,
            name: formValues.name,
            address: formValues.address,
            email: formValues.email,
            phone: formValues.phone,
            status: formValues.status
        };


        if (this.isEditMode) {
            this._companyService.updateCompany(this.companyId, payload)
                .subscribe({
                    next: (updatedCompany) => {
                        this._snackBar.open("Company updated successfully", "Close", {duration: 3000});
                        this._router.navigateByUrl("/companies");
                    },
                    error: (error) => {
                        this._snackBar.open("Error updating company", "Close", {duration: 3000});
                    }
                });
        } else {
            this._companyService.createCompany(payload)
                .subscribe({
                    next: (createdCompany) => {
                        this._snackBar.open("Company created successfully", "Close", {duration: 3000});
                        this._router.navigateByUrl("/companies");
                    },
                    error: (error) => {
                        this._snackBar.open("Error creating company", "Close", {duration: 3000});
                    }
                });
        }
    }

    fieldInvalid(fildName: string): boolean {
        return this.companyForm.get(fildName)?.invalid && this.companyForm.get(fildName)?.touched
    }
}


