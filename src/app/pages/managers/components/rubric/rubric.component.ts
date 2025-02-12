import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { IRubric } from 'src/app/models/rubric';
import { DialogService } from 'src/app/services/dialog.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { createRubric, IAppState, listAllRubrics, updateRubric } from 'src/app/store';
import { selectSelectedRubrics, selectRubricIsLoading, selectRubricIsSaving, selectRubricErrorMessage, selectSelectedRubric } from 'src/app/store/selectors/rubric.selectors';


@Component({
  selector: 'app-rubric',
  templateUrl: './rubric.component.html',
})
export class RubricComponent implements OnInit {

  rubricForm: FormGroup;
  rubrics: IRubric[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;
  rubric!: IRubric;
  rubricsColumns: { key: keyof IRubric; label: string }[] = [];
  isRubricsLoading$: Observable<boolean>;
  isRubricSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  getRubrics$ = this._store.pipe(select(selectSelectedRubrics));


  constructor(
    private _fb: FormBuilder,
    private _store: Store<IAppState>,
    private _dialogService: DialogService
  ) {
    this.rubricForm = this._fb.group({
      rubricId: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, Validators.min(0)],
    });

    this.isRubricsLoading$ = this._store.select(selectRubricIsLoading);
    this.isRubricSaving$ = this._store.select(selectRubricIsSaving);

    this.rubricsColumns = [
      { key: 'rubricId', label: 'Código' },
      { key: 'name', label: 'Nome' },
      { key: 'description', label: 'Descrição' },
      { key: 'price', label: 'Preço' }
    ]
  }

  ngOnInit(): void {
    this.loadRubrics();
  }

  loadRubrics(): void {
    this._store.dispatch(listAllRubrics())
    this.getRubrics$.pipe(takeUntil(this.destroy$)).subscribe(rubrics => {
      if (rubrics) {
        this.rubrics = rubrics
      }
    })
  }

  submitRubricForm(): void {

    if (this.rubricForm.valid) {

      const payload = this.rubricForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateRubric({ rubricId: payload.rubricId, rubric: payload }));
        this._store.pipe(select(selectRubricErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Actualizacao da Rúbrica',
                type: 'error',
                message: 'Um erro ocorreu ao actualizar a Rúbrica! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedRubrics), filter((rubric) => !!rubric))
                .subscribe((rubric) => {
                  if (rubric) {
                    this.eraseForm()
                    this.isEditing = false;
                    this._dialogService.open({
                      title: 'Actualizacao da Rúbrica',
                      type: 'success',
                      message: 'Rúbrica Actualizada com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                  }
                });
            }
          }
        )
      } else {
        this._store.dispatch(createRubric({ rubric: payload }));
        this._store.pipe(select(selectRubricErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Criação da Rúbrica',
                type: 'error',
                message: 'Um erro ocorreu ao criar a Rúbrica! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedRubric), filter((rubric) => !!rubric))
                .subscribe((rubric) => {
                  if (rubric) {
                    this._dialogService.open({
                      title: 'Criação de Rúbrica',
                      type: 'success',
                      message: 'Rúbrica criada com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                    this.eraseForm()
                  }
                });
            }

          })

      }
    }
    else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor verifique se os campos estão devidadmente preenchidos e volte a submeter.',
        isProcessing: false,
        showConfirmButton: false,
      })
    }
  }

  eraseForm() {
    this.rubricForm.reset();
  }

  editRubric(rubric: any): void {
    this.isEditing = true;
    this.rubric = rubric;
    this.rubricForm.patchValue({
      rubricId: this.rubric.rubricId,
      name: this.rubric.name,
      description: this.rubric.description,
      price: this.rubric.price
    });
  }

  deleteRubric(index: number): void {
    this.rubrics.splice(index, 1);
  }
}
