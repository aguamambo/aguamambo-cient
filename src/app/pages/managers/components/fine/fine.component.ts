import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IFineConfiguration } from 'src/app/models/fineConfiguration';
import { createFineConfiguration, IAppState, listAllFineConfigurations, updateFineConfiguration } from 'src/app/store';
import { selectFineConfigurationIsLoading, selectFineConfigurationIsSaving, selectSelectedFineConfiguration, selectSelectedFineConfigurations } from 'src/app/store/selectors/fineConfiguration.selectors';
 

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
  fineConfigurationsColumns: {key: keyof IFineConfiguration;  label: string}[] = [];
 
  private destroy$ = new Subject<void>();
  getFineConfigurations$ = this.store.pipe(select(selectSelectedFineConfigurations));

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.fineForm = this.fb.group({
      maxInterval: [null, [Validators.required, Validators.min(0)]],
      minInterval: [null, [Validators.required, Validators.min(0)]],
      acruedFinePercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.isFineConfigurationsLoading$ = this.store.select(selectFineConfigurationIsLoading)
    this.isFineConfigurationSaving$ = this.store.select(selectFineConfigurationIsSaving)

    this.fineConfigurationsColumns = [
      {key: 'fineConfigurationId', label: 'Código'},
      {key: 'minInterval', label: 'Intervalo Mínimo'},
      {key: 'maxInterval', label: 'Intervalo Máximo'},
      {key: 'acruedFinePercentage', label: 'Percentagem de Multa (%)'}
    ]
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.store.dispatch(listAllFineConfigurations())
    this.getFineConfigurations$.pipe(takeUntil(this.destroy$)).subscribe(fineConfigurations => {
      if (fineConfigurations) {
        this.fineConfigurations =  fineConfigurations;
      }
    })
  }

  submitForm(): void {
    if (this.fineForm.valid) {
      const payoad = this.fineForm.value;
      if (this.isEditing) {
        this.store.dispatch(updateFineConfiguration({fineConfigurationId: this.fineConfiguration.fineConfigurationId, fineConfiguration: payoad}))
        this.isEditing = false; 
      } else {
        this.store.dispatch(createFineConfiguration({fineConfiguration: payoad}))
      }
      this.store.dispatch(listAllFineConfigurations())
      this.fineForm.reset();
    }
  }

  editFineConfiguration(fineConfiguration: any): void {
    this.isEditing = true;
    this.fineConfiguration = fineConfiguration;
    this.fineForm.patchValue(fineConfiguration);
  }
 

  deleteFineConfiguration(index: number): void {
    this.fineConfigurations.splice(index, 1);
  }
}
