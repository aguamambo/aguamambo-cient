import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IRubric } from 'src/app/models/rubric';
import { IAppState, listAllRubrics, updateRubric } from 'src/app/store';
import { selectSelectedRubrics, selectRubricIsLoading, selectRubricIsSaving } from 'src/app/store/selectors/rubric.selectors';
 

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
  rubricsColumns: {key: keyof IRubric;  label: string}[] = [];
  isRubricsLoading$: Observable<boolean>;
  isRubricSaving$: Observable<boolean>;  
  private destroy$ = new Subject<void>();
 getRubrics$ = this.store.pipe(select(selectSelectedRubrics));

 
 constructor(private fb: FormBuilder, private store: Store<IAppState>) {
   this.rubricForm = this.fb.group({
     rubricId: ['', [Validators.required, Validators.minLength(5)]],
     name: ['', Validators.required],
     description: ['', Validators.required],
     price: [null, [Validators.required, Validators.min(0)]],
    });

    this.isRubricsLoading$ = this.store.select(selectRubricIsLoading);
    this.isRubricSaving$ = this.store.select(selectRubricIsSaving);
   
    this.rubricsColumns = [
      {key: 'rubricId', label: 'Código'},
      {key: 'name', label: 'Nome'},
      {key: 'description', label: 'Descrição'},
      {key: 'price', label: 'Preço'}
    ]
  }

  ngOnInit(): void {
    this.loadRubrics();
  }

  loadRubrics(): void {
    this.store.dispatch(listAllRubrics())
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
        this.store.dispatch(updateRubric({rubricId: this.rubric.rubricId, rubric: payload}))
        this.isEditing = false;  
      } else {
        
      }
      this.rubricForm.reset();
    }
  }

  editRubric(rubric: any): void {
    this.isEditing = true;
    this.rubric = rubric;
    this.rubricForm.patchValue(rubric);
  }

  deleteRubric(index: number): void {
    this.rubrics.splice(index, 1);
  }
}
