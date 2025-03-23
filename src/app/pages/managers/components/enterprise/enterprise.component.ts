import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { IEnterprise } from 'src/app/models/enterprise';
import { DialogService } from 'src/app/services/dialog.service';
import { createEnterprise, IAppState, listAllEnterprises, updateEnterprise } from 'src/app/store';
import { selectEnterpriseErrorMessage, selectEnterpriseIsLoading, selectEnterpriseIsSaving, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';

@Component({
  selector: 'app-enterprise',
  templateUrl: './enterprise.component.html',
})
export class EnterpriseComponent implements OnInit {

  enterpriseForm: FormGroup;
  enterprises: IEnterprise[] = [];
  enterprise!: IEnterprise;
  isEnterprisesLoading$: Observable<boolean>;
  isEnterpriseSaving$: Observable<boolean>;
  isEditing: boolean = false;
  enterprisesColumns: { key: keyof IEnterprise; label: string }[] = [];

  private destroy$ = new Subject<void>();
  getEnterprises$ = this._store.pipe(select(selectSelectedEnterprises));

  constructor(
    private _fb: FormBuilder,
    private _store: Store<IAppState>,
    private _dialogService: DialogService
  ) {
    this.enterpriseForm = this._fb.group({
      enterpriseId: [''],
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      nuit: new FormControl(null, Validators.required),
      phoneNumber: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
    });

    this.isEnterprisesLoading$ = this._store.select(selectEnterpriseIsLoading);
    this.isEnterpriseSaving$ = this._store.select(selectEnterpriseIsSaving);

    this.enterprisesColumns = [
      { key: 'enterpriseId', label: 'Código' },
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Emai' },
      { key: 'nuit', label: 'NUIT' },
      { key: 'phoneNumber', label: 'Telefone' },
      { key: 'address', label: 'Endereço' }
    ]
  }

  ngOnInit(): void {
    this.loadEnterprises();
  }

  loadEnterprises(): void {
    this._dialogService.reset()
    this._store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprises = enterprises;
      }
    });

  }

  submitEnterpriseForm(): void {
    this._dialogService.reset()
    if (this.enterpriseForm.valid) {
      const payload = this.enterpriseForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateEnterprise({ enterpriseId: payload.enterpriseId, enterprise: payload }));
        this._store.pipe(select(selectEnterpriseErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Actualizacao da Empresa',
                type: 'error',
                message: 'Um erro ocorreu ao actualizar a Empresa! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedEnterprises), filter((rubric) => !!rubric))
                .subscribe((rubric) => {
                  if (rubric) {
                    this.isEditing = false;
                    this._dialogService.open({
                      title: 'Actualizacao da Empresa',
                      type: 'success',
                      message: 'Empresa Actualizada com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                    this.eraseForm();
                  }
                });
            }
          }
        )
      } else {
        this._store.dispatch(createEnterprise({ enterprise: payload }));
        this._store.pipe(select(selectEnterpriseErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Criação da Empresa',
                type: 'error',
                message: 'Um erro ocorreu ao criar a Empresa! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this._store.pipe(select(selectSelectedEnterprises), filter((enterprise) => !!enterprise))
                .subscribe((enterprise) => {
                  if (enterprise) {
                    this._dialogService.open({
                      title: 'Criação de Empresa',
                      type: 'success',
                      message: 'Empresa criada com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                    this.eraseForm();
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
    this.enterpriseForm.reset();
  }

  editEnterprise(enterprise: any): void {
    this.isEditing = true;
    this.enterprise = enterprise
    this.enterpriseForm.patchValue({
      enterpriseId: this.enterprise.enterpriseId,
      name: this.enterprise.name,
      email: this.enterprise.email,
      nuit: this.enterprise.nuit,
      phoneNumber: this.enterprise.phoneNumber,
      address: this.enterprise.address,
    });
  }

  deleteEnterprise(index: number): void {
    this.enterprises.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}
