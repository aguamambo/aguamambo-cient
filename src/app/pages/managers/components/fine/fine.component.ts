import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { IFineConfiguration } from 'src/app/models/fineConfiguration';
import { DialogService } from 'src/app/services/dialog.service';
import { createFineConfiguration, IAppState, listAllFineConfigurations, updateFineConfiguration } from 'src/app/store';
import { selectFineConfigurationErrorMessage, selectFineConfigurationIsLoading, selectFineConfigurationIsSaving, selectSelectedFineConfiguration, selectSelectedFineConfigurations } from 'src/app/store/selectors/fineConfiguration.selectors';


@Component({
  selector: 'app-fine',
  templateUrl: './fine.component.html',
})
export class FineComponent implements OnInit {

  fineForm: FormGroup;
  fineConfigurations: IFineConfiguration[] = [];
  isEditing: boolean = false;
  fineConfiguration!: IFineConfiguration;
  isFineConfigurationsLoading$: Observable<boolean>;
  isFineConfigurationSaving$: Observable<boolean>;
  fineConfigurationsColumns: { key: keyof IFineConfiguration; label: string }[] = [];

  private destroy$ = new Subject<void>();
  getFineConfigurations$ = this._store.pipe(select(selectSelectedFineConfigurations));

  constructor(
    private _fb: FormBuilder,
    private _store: Store<IAppState>,
    private _dialogService: DialogService
  ) {
    this.fineForm = this._fb.group({
      fineConfigurationId: [''],
      maxInterval: [null, [Validators.required, Validators.min(0)]],
      minInterval: [null, [Validators.required, Validators.min(0)]],
      acruedFinePercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.isFineConfigurationsLoading$ = this._store.select(selectFineConfigurationIsLoading)
    this.isFineConfigurationSaving$ = this._store.select(selectFineConfigurationIsSaving)

    this.fineConfigurationsColumns = [
      { key: 'fineConfigurationId', label: 'Código' },
      { key: 'minInterval', label: 'Intervalo Mínimo' },
      { key: 'maxInterval', label: 'Intervalo Máximo' },
      { key: 'acruedFinePercentage', label: 'Percentagem de Multa (%)' }
    ]
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this._dialogService.reset()
    this._store.dispatch(listAllFineConfigurations())
    this.getFineConfigurations$.pipe(takeUntil(this.destroy$)).subscribe(fineConfigurations => {
      if (fineConfigurations) {
        this.fineConfigurations = fineConfigurations;
      }
    })
  }

  submitFineConfigurationForm(): void {
    this._dialogService.reset()
    if (this.fineForm.valid) {

      const payload = this.fineForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateFineConfiguration({ fineConfigurationId: payload.fineConfigurationId, fineConfiguration: payload }));
        this._store.pipe(select(selectFineConfigurationErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Actualizacao da Multa',
                type: 'error',
                message: 'Um erro ocorreu ao actualizar a Multa! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedFineConfigurations), filter((fineConfiguration) => !!fineConfiguration))
                .subscribe((fineConfiguration) => {
                  if (fineConfiguration) {
                    this.eraseForm()
                    this.isEditing = false;
                    this._dialogService.open({
                      title: 'Actualizacao da Multa',
                      type: 'success',
                      message: 'Multa Actualizado com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                  }
                });
            }
          }
        )
      } else {
        this._store.dispatch(createFineConfiguration({ fineConfiguration: payload }));
        this._store.pipe(select(selectFineConfigurationErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Criação da Multa',
                type: 'error',
                message: 'Um erro ocorreu ao criar a Multa! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedFineConfiguration), filter((fineConfiguration) => !!fineConfiguration))
                .subscribe((fineConfiguration) => {
                  if (fineConfiguration) {
                    this._dialogService.open({
                      title: 'Criação de Multa',
                      type: 'success',
                      message: 'Multa criada com sucesso!',
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
    this._dialogService.reset()
    this.fineForm.reset();
  }

  editFineConfiguration(fineConfiguration: any): void {
    this.isEditing = true;
    this.fineConfiguration = fineConfiguration;
    this.fineForm.patchValue({
      fineConfigurationId: this.fineConfiguration.fineConfigurationId,
      maxInterval: this.fineConfiguration.maxInterval,
      minInterval: this.fineConfiguration.minInterval,
      acruedFinePercentage: this.fineConfiguration.acruedFinePercentage
    });
  }


  deleteFineConfiguration(index: number): void {
    this.fineConfigurations.splice(index, 1);
  }
}
