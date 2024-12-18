import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ICut } from 'src/app/models/cut';
import { IAppState, listAllCuts, updateCut } from 'src/app/store';
import { selectCutIsLoading, selectCutIsSaving, selectSelectedCuts } from 'src/app/store/selectors/cut.selectors';

@Component({
  selector: 'app-list-cuts',
  templateUrl: './list-cuts.component.html',
  styleUrl: './list-cuts.component.css'
})
export class ListCutsComponent implements OnInit, OnDestroy {
  cutForm: FormGroup;
  cutsList: ICut[] = [];
  cutsData: ICut[] = [];
  cutColumns: { key: keyof ICut; label: string }[] = [];
  isEditing: boolean = false;
  selectedCut!: ICut;

  isCutsLoading$: Observable<boolean>;
  isCutSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.cutForm = this.fb.group({
      cutsId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      clientId: ['', Validators.required]
    });

    this.isCutsLoading$ = this.store.select(selectCutIsLoading);
    this.isCutSaving$ = this.store.select(selectCutIsSaving);

    this.cutColumns = [
      { key: 'cutId', label: 'Código de Corte' },
      { key: 'startDate', label: 'Data de Início' },
      { key: 'endDate', label: 'Data de Fim' },
      { key: 'clientId', label: 'ID do Cliente' }
    ];
  }

  ngOnInit(): void {
    this.loadCuts();
    
    
  }

  private loadCuts(): void {
    this.store.dispatch(listAllCuts());
    this.store.pipe(select(selectSelectedCuts), takeUntil(this.destroy$)).subscribe(cuts => {
      if (cuts) {
        this.cutsList = cuts;
        this.cutsData = cuts.map(cut => ({
          ...cut,
          startDate: this.formatDate(cut.startDate),
          endDate: this.formatDate(cut.endDate)
        }));
        
        console.log(this.cutsData);
      }
    });
  }

  editCut(cut: ICut): void {
    this.isEditing = true;
    this.selectedCut = cut;
    this.cutForm.patchValue({
      cutsId: cut.cutId,
      startDate: cut.startDate,
      endDate: cut.endDate,
      clientId: cut.clientId
    });
  }

  submitForm(): void {
    if (this.cutForm.valid && this.isEditing) {
      const payload = this.cutForm.value;
      this.store.dispatch(updateCut({ cutId: this.selectedCut.cutId, cut: payload }));
      this.isEditing = false;
      this.cutForm.reset();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}