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
    this._dialogService.reset()
    this._store.dispatch(listAllContractTypes());
    this.getContractTypes$.pipe(takeUntil(this.destroy$)).subscribe((contractTypes) => {
      if (contractTypes) {
        this.contractTypes = contractTypes
      }
    })
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

  submitContractTypeForm(): void {
  this._dialogService.reset();

  if (this.contractTypeForm.valid) {
    const payload = this.contractTypeForm.value;

    if (this.isEditing) {
      this._store.dispatch(updateContractType({ contractTypeId: payload.contractTypeId, contractType: payload }));

      this._store.pipe(select(selectContractTypeErrorMessage)).subscribe(error => {
        if (error) {
          this._dialogService.open({
            title: 'Actualização do Tipo de Contrato',
            type: 'error',
            message: 'Ocorreu um erro ao actualizar o Tipo de Contrato. Verifique os dados e tente novamente.',
            isProcessing: false,
            showConfirmButton: false,
            errorDetails: error
          });
        } else {
          this._store.pipe(
            select(selectSelectedContractType),
            filter(ct => !!ct)
          ).subscribe(contractType => {
            if (contractType) {
              this.isEditing = false;
              this._dialogService.open({
                title: 'Actualização do Tipo de Contrato',
                type: 'success',
                message: 'Tipo de Contrato actualizado com sucesso!',
                isProcessing: false,
                showConfirmButton: false,
              });
              this.eraseContractTypeForm();
            }
          });
        }
      });
    } else {
      this._store.dispatch(createContractType({ contractType: payload }));

      this._store.pipe(select(selectContractTypeErrorMessage)).subscribe(error => {
        if (error) {
          this._dialogService.open({
            title: 'Criação do Tipo de Contrato',
            type: 'error',
            message: 'Ocorreu um erro ao criar o Tipo de Contrato. Verifique os dados e tente novamente.',
            isProcessing: false,
            showConfirmButton: false,
            errorDetails: error
          });
        } else {
          this._store.pipe(
            select(selectSelectedContractType),
            filter(ct => !!ct)
          ).subscribe(contractType => {
            if (contractType) {
              this._dialogService.open({
                title: 'Criação do Tipo de Contrato',
                type: 'success',
                message: 'Tipo de Contrato criado com sucesso!',
                isProcessing: false,
                showConfirmButton: false,
              });
              this.eraseContractTypeForm();
            }
          });
        }
      });
    }
  } else {
    this._dialogService.open({
      title: 'Validação de Dados',
      type: 'info',
      message: 'Por favor verifique se os campos estão devidamente preenchidos e tente novamente.',
      isProcessing: false,
      showConfirmButton: false,
    });
  }
}
 

 eraseContractTypeForm() {
    this._dialogService.reset()
    this.contractTypeForm.reset();
  }

  deleteContractType(index: number): void {
    this.contractTypes.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}