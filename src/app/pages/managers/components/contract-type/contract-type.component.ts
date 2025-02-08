import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { IContractType } from 'src/app/models/contractType';
import { DialogService } from 'src/app/services/dialog.service';
import { createContractType, IAppState, listAllContractTypes, updateContractType } from 'src/app/store';
import { selectAllContractTypes } from 'src/app/store/reducers/contractType.reducers';
import { selectContractTypeErrorMessage, selectContractTypeIsLoading, selectContractTypeIsSaving, selectSelectedContractType, selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';


@Component({
  selector: 'app-contract-type',
  templateUrl: './contract-type.component.html',
  styleUrl: './contract-type.component.css'
})
export class ContractTypeComponent implements OnInit {

  contractTypeForm: FormGroup;
  contractTypes: IContractType[] = [];
  contractType!: IContractType;
  isContractTypesLoading$: Observable<boolean>;
  isContractTypeSaving$: Observable<boolean>;
  contractTypesColumns: { key: keyof IContractType, label: string }[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;
  private destroy$ = new Subject<void>();
  getContractTypes$ = this._store.pipe(select(selectSelectedContractTypes));


  constructor(
    private _fb: FormBuilder,
    private _store: Store<IAppState>,
    private _dialogService: DialogService
  ) {
    this.contractTypeForm = this._fb.group({
      contractTypeId: [''],
      designation: new FormControl(null, Validators.required),
      minimumConsumptionValue: new FormControl(null, Validators.required),
      pricePerConsumptionUnit: new FormControl(null, Validators.required),
      reconnectionFee: new FormControl(null, Validators.required)
    });

    this.isContractTypesLoading$ = this._store.select(selectContractTypeIsLoading)
    this.isContractTypeSaving$ = this._store.select(selectContractTypeIsSaving)

    this.contractTypesColumns = [
      { key: 'contractTypeId', label: 'Código' },
      { key: 'designation', label: 'Designação' },
      { key: 'minimumConsumptionValue', label: 'Valor Mínimo de Consumo' },
      { key: 'pricePerConsumptionUnit', label: 'Preço por Unidade de Consumo' },
      { key: 'reconnectionFee', label: 'Taxa de Religação' }
    ]
  }

  ngOnInit(): void {
    this.loadContractTypes();
  }

  loadContractTypes(): void {
    this._store.dispatch(listAllContractTypes());
    this.getContractTypes$.pipe(takeUntil(this.destroy$)).subscribe((contractTypes) => {
      if (contractTypes) {
        this.contractTypes = contractTypes
      }
    })
  }

  submitForm(): void {
    if (this.contractTypeForm.valid) {
      const payload = this.contractTypeForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateContractType({ contractTypeId: this.contractType.contractTypeId, contractType: payload }))
        this.isEditing = false;
      } else {
        this._store.dispatch(createContractType({ contractType: payload }))
      }
      this._store.dispatch(listAllContractTypes())
      this.eraseForm()
    }
  }

  eraseForm() {
    this.contractTypeForm.reset();
  }
  submitContractTypeForm(): void {

    if (this.contractTypeForm.valid) {

      const payload = this.contractTypeForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateContractType({ contractTypeId: payload.contractTypeId, contractType: payload }));
        this._store.pipe(select(selectContractTypeErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Actualizacao do Contacto',
                type: 'error',
                message: 'Um erro ocorreu ao actualizar o Contacto! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
              })
            } else {
              this._store.pipe(select(selectSelectedContractTypes), filter((contractType) => !!contractType))
                .subscribe((contractType) => {
                  if (contractType) {
                    this.eraseForm()
                    this.isEditing = false;
                    this._dialogService.open({
                      title: 'Actualizacao do Contacto',
                      type: 'success',
                      message: 'Contacto Actualizado com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                  }
                });
            }
          }
        )
      } else {
        this._store.dispatch(createContractType({ contractType: payload }));
        this._store.pipe(select(selectContractTypeErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Criação do Contacto',
                type: 'error',
                message: 'Um erro ocorreu ao criar o Contacto! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
              })
            } else {
              this._store.pipe(select(selectSelectedContractTypes), filter((contractType) => !!contractType))
                .subscribe((contractType) => {
                  if (contractType) {
                    this._dialogService.open({
                      title: 'Criação de Contacto',
                      type: 'success',
                      message: 'Contacto criado com sucesso!',
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

  editContractType(contractType: any): void {
    this.isEditing = true;
    this.contractType = contractType
    this.contractTypeForm.patchValue({
      contractTypeId: this.contractType.contractTypeId,
      designation: this.contractType.designation,
      minimumConsumptionValue: this.contractType.minimumConsumptionValue,
      pricePerConsumptionUnit: this.contractType.pricePerConsumptionUnit,
      reconnectionFee: this.contractType.reconnectionFee
    });
  }

  deleteContractType(index: number): void {
    this.contractTypes.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}