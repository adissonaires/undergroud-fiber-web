import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import {PriceCompositionType, ProjectsService} from "../projects.service";

@Component({
  selector: 'project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormComponent implements OnInit
{
  // FormGroup para nosso formulário
  projectForm: FormGroup;

  // Lista de price composition types retornados do endpoint
  priceCompositionTypes: PriceCompositionType[] = [];

  // Para gerenciar unsubscribe
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Construtor
   */
  constructor(
      private _formBuilder: FormBuilder,
      private _cdr: ChangeDetectorRef,
      private _projectsService: ProjectsService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void
  {
    // Criamos o form
    this.createProjectForm();

    // Carregamos os priceCompositionTypes do back-end
    this._projectsService.getPriceCompositionTypes()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
          this.priceCompositionTypes = response;
          this._cdr.markForCheck();
        });
  }

  private createProjectForm() {
    this.projectForm = this._formBuilder.group({
      name: [''],
      map: [''],
      priceCompositionTypeId: [null]
    });
  }

  /**
   * Destrói subscriptions para evitar leaks
   */
  ngOnDestroy(): void
  {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  trackByFn(index: number, pc: PriceCompositionType): number {
    return pc.id;
  }
}


