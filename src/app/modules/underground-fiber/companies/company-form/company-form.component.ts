import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {Company, CompanyService} from "../company.service";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'company-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatSnackBarModule,
    ],
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
        private _snackBar: MatSnackBar
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
            name: [''],
            address: [''],
            email: [''],
            phone: [''],
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

    createCompany(): void {
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
}


