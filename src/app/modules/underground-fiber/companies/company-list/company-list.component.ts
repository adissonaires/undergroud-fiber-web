import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Company, CompanyService} from "../company.service";
import {ActivatedRoute, Router} from "@angular/router";
import {JsonPipe} from "@angular/common";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-company-list',
    imports: [
        FormsModule,
        JsonPipe
    ],
    templateUrl: './company-list.component.html',
    standalone: true,
    styleUrl: './company-list.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyListComponent implements OnInit {
    companies: Company[] = [];

    constructor(
        private _companyService: CompanyService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) {
    }

    ngOnInit(): void {
        this.loadCompanies();
    }

    loadCompanies(): void {
        this._companyService.getAllCompanies().subscribe((response: Company[]) => {
            this.companies = response;
            this._cdr.markForCheck();
        });
    }

    trackByFn(index: number, company: Company): any {
        return company.id || index;
    }

    openCompanyFormCreate(): void {
        this._router.navigate(['create'], {relativeTo: this._activatedRoute});
    }

    openCompanyFormEdit(id: number): void {
        this._router.navigate([`${id}/edit`], {relativeTo: this._activatedRoute});
    }

    openFormCreateUser(id: number): void {
        this
    }

    deleteCompany(id: number) {
        this._companyService.deleteCompany(id).subscribe({
            next: (deletedCompany) => {
                this._snackBar.open("Company deleted successfully", "Close", {duration: 3000});
            },
            error: (error) => {
                this._snackBar.open("Error deleting company", "Close", {duration: 3000});
            }
        })
    }
}
