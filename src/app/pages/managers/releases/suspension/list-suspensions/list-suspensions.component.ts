import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IOption } from 'src/app/models/option';
import { ISuspension } from 'src/app/models/suspension';
import { IAppState, listAllSuspensions, updateSuspension } from 'src/app/store';
import { selectSelectedSuspensions, selectSuspensionIsLoading, selectSuspensionIsSaving } from 'src/app/store/selectors/suspension.selectors';

@Component({
  selector: 'app-list-suspensions',
  templateUrl: './list-suspensions.component.html',
  styleUrl: './list-suspensions.component.css'
})
export class ListSuspensionsComponent implements OnInit, OnDestroy {
  suspensionForm: FormGroup;
  suspensionsList: ISuspension[] = [];
  suspensionsData: ISuspension[] = [];
  clientsData: IOption[] = [];
  suspensionColumns: { key: keyof ISuspension; label: string }[] = [];
  isEditing: boolean = false;
  selectedSuspension!: ISuspension;

  isSuspensionsLoading$: Observable<boolean>;
  isSuspensionSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.suspensionForm = this.fb.group({
      clientId: ['', Validators.required],
      reason: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      status: ['', Validators.required]
    });

    this.isSuspensionsLoading$ = this.store.select(selectSuspensionIsLoading);
    this.isSuspensionSaving$ = this.store.select(selectSuspensionIsSaving);

    this.suspensionColumns = [
      { key: 'suspensionId', label: 'Código' },
      { key: 'clientId', label: 'Código do Cliente' }, 
      { key: 'startDate', label: 'Data Início' },
      { key: 'endDate', label: 'Data Fim' } 
    ];
  }

  ngOnInit(): void {
    this.loadSuspensionsData();
    this.suspensionForm.controls['status'].disable();
  }

  private loadSuspensionsData(): void {
    this.store.dispatch(listAllSuspensions());
    this.store.pipe(select(selectSelectedSuspensions), takeUntil(this.destroy$)).subscribe(suspensions => {
      if (suspensions) {
        this.suspensionsList = suspensions;
        this.suspensionsData = suspensions.map(suspension => ({
          ...suspension,
          startDate: this.formatDate(suspension.startDate),
          endDate: suspension.endDate ? this.formatDate(suspension.endDate) : ''
        }));
      }
    });
  }

  editSuspension(suspension: ISuspension): void {
    this.isEditing = true;
    this.selectedSuspension = suspension;
    this.suspensionForm.patchValue({
      clientId: suspension.clientId, 
      startDate: suspension.startDate,
      endDate: suspension.endDate 
    });
  }

  submitForm(): void {
    this.suspensionForm.controls['status'].enable();
    if (this.suspensionForm.valid && this.isEditing) {
      const payload = this.suspensionForm.value;
      this.store.dispatch(updateSuspension({ suspensionId: this.selectedSuspension.suspensionId, suspension: payload }));
      this.isEditing = false;
      this.suspensionForm.reset();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
}