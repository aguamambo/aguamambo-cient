import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IEnterprise } from 'src/app/models/enterprise';
import { createEnterprise, IAppState, listAllEnterprises, updateEnterprise } from 'src/app/store';
import { selectEnterpriseIsLoading, selectEnterpriseIsSaving, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
 
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
  enterprisesColumns: {key: keyof IEnterprise;  label: string}[] = [];
 
  private destroy$ = new Subject<void>();
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.enterpriseForm = this.fb.group({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      nuit: new FormControl(null, Validators.required),
      phoneNumber: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
    });

    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isEnterpriseSaving$ = this.store.select(selectEnterpriseIsSaving);

    this.enterprisesColumns = [
      {key: 'enterpriseId', label: 'Código'},
      {key: 'name', label: 'Nome'},
      {key: 'email', label: 'Emai'},
      {key: 'nuit', label: 'NUIT'},
      {key: 'phoneNumber', label: 'Telefone'},
      {key: 'address', label: 'Endereço'}
      ]
  }

  ngOnInit(): void {
    this.loadEnterprises();
  }

  loadEnterprises(): void {
    this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprises = enterprises;
      }
    });
     
  }

  submitForm(): void {
    if (this.enterpriseForm.valid) {
      const payload = this.enterpriseForm.value;

      if (this.isEditing) { 
        this.store.dispatch(updateEnterprise({enterpriseId: this.enterprise.enterpriseId ,enterprise: payload}))
        this.isEditing = false; 
      } else { 
        this.store.dispatch(createEnterprise({enterprise: payload}));         
      }
        this.store.dispatch(listAllEnterprises());
        this.enterpriseForm.reset();
    }
  }

  editEnterprise(enterprise: any): void {
    this.isEditing = true;
    this.enterprise = enterprise
    this.enterpriseForm.patchValue(enterprise);
  }

  deleteEnterprise(index: number): void {
    this.enterprises.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}
