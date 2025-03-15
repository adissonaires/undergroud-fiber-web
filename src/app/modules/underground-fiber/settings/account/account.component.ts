import { TextFieldModule } from '@angular/cdk/text-field';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {SettingsService} from "../settings.service";
import {AuthService} from "../../../../core/auth/auth.service";
import {UserService} from "../../../../core/user/user.service";

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class SettingsAccountComponent implements OnInit {
    accountForm: UntypedFormGroup;

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
                private _settingsService: SettingsService,
                private _authService: AuthService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.accountForm = this._formBuilder.group({
            name: [''],
            username: [''],
            title: [''],
            company: [''],
            about: [''],
            email: ['', Validators.email],
            phone: [''],
        });
        console.log('this._userService.user', this._authService.userId)

        this.getSettingsAccountByUserId();

    }

    getSettingsAccountByUserId() {
        console.log('this._authService', this._authService.company);
        this._settingsService.getAccountByUserId(this._authService.userId).subscribe(response => {
            console.log('response', response);
            // Create the form
            this.accountForm.get('name').setValue(response.name);
            this.accountForm.get('username').setValue(response.email);
            this.accountForm.get('company').setValue(response.company.name);
            this.accountForm.get('email').setValue(response.email);
            this.accountForm.get('phone').setValue(response.name);
        })
    }
}
