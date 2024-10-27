import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IContractType } from 'src/app/models/contractType';
import { createContractType, IAppState, listAllContractTypes, updateContractType } from 'src/app/store';
import { selectAllContractTypes } from 'src/app/store/reducers/contractType.reducers';
import { selectContractTypeIsLoading, selectContractTypeIsSaving, selectSelectedContractType, selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';


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
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));


  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.contractTypeForm = this.fb.group({
      designation: new FormControl(null, Validators.required),
      minimumConsumptionValue: new FormControl(null, Validators.required),
      pricePerConsumptionUnit: new FormControl(null, Validators.required),
      reconnectionFee: new FormControl(null, Validators.required)
    });

    this.isContractTypesLoading$ = this.store.select(selectContractTypeIsLoading)
    this.isContractTypeSaving$ = this.store.select(selectContractTypeIsSaving)

    this.contractTypesColumns = [
      {key: 'contractTypeId', label: 'Código'},
      {key: 'designation', label: 'Designação'},
      {key: 'minimumConsumptionValue', label: 'Valor Mínimo de Consumo'},
      {key: 'pricePerConsumptionUnit', label: 'Preço por Unidade de Consumo'},
      {key: 'reconnectionFee', label: 'Taxa de Religação'}
    ]
  }

  ngOnInit(): void {
    this.loadContractTypes();
  }

  loadContractTypes(): void {
    this.store.dispatch(listAllContractTypes());
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
         this.store.dispatch(updateContractType({contractTypeId: this.contractType.contractTypeId, contractType: payload}))
        this.isEditing = false; 
      } else {
        this.store.dispatch(createContractType({contractType: payload}))
      }
      this.store.dispatch(listAllContractTypes())
      this.contractTypeForm.reset();
    }
  }

  editContractType(contractType: any): void {
    this.isEditing = true;
    this.contractType = contractType
    this.contractTypeForm.patchValue(contractType);
  }

  deleteContractType(index: number): void {
    this.contractTypes.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}