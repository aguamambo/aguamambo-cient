import { createZone, getZone, listAllZones, updateZone } from './../../../../store/actions/zone.actions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IEnterprise } from 'src/app/models/enterprise';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { IAppState, listAllEnterprises } from 'src/app/store';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedZones, selectZoneIsLoading, selectZoneIsSaving } from 'src/app/store/selectors/zone.selectors';


@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
})
export class ZoneComponent implements OnInit {
  zoneForm: FormGroup;
  zones: IZone[] = [];
  enterpriseData: IOption[] = [];
  enterprisesList: IEnterprise[] = [];
  zone!: IZone;
  zonesColumns: {key: keyof IZone;  label: string}[] = [];
  isZonesLoading$: Observable<boolean>;
  isZoneSaving$: Observable<boolean>; 
  isEnterprisesLoading$: Observable<boolean>;
  isEditing: boolean = false;
  editIndex: number | null = null;
  private destroy$ = new Subject<void>();

  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getZones$ = this.store.pipe(select(selectSelectedZones));


  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.zoneForm = this.fb.group({ 
      designation: ['', Validators.required],
      description: ['', Validators.required],
      enterpriseId: ['', Validators.required]
    });

    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isZoneSaving$ = this.store.select(selectZoneIsSaving);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);

    this.zonesColumns = [
      {key: 'zoneId', label: 'Código'},
      {key: 'designation', label: 'Nome'},
      {key: 'description', label: 'Descrição'},
      {key: 'enterpriseName', label: 'Empresa'}
    ]
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.store.dispatch(listAllZones());
    this.store.dispatch(listAllEnterprises());

    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [
          { label: 'Seleccione...', value: '' },
          ...enterprises.map(Enterprise => ({
            label: Enterprise.name,
            value: Enterprise.enterpriseId
          }))
        ];
        
        this.getZones$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
          if (zones) {
            this.zones = zones.map(zone => {
              const enterprise = enterprises.find(e => e.enterpriseId === zone.enterpriseId);
              return {
                ...zone,
                enterpriseName: enterprise ? enterprise.name : ''
              };
            });
          }
        });
        
      }
    });
  }

  submitForm(): void {
    if (this.zoneForm.valid) {
      const payload = this.zoneForm.value;

      if (this.isEditing) {
         this.store.dispatch(updateZone({zoneId: this.zone.zoneId ,zone: payload}))
        this.isEditing = false; 
      } else {
         this.store.dispatch(createZone({zone: payload}))
      }
      this.store.dispatch(listAllZones());
      this.zoneForm.reset();
    }
  }

  editzone(zone: any): void {
    this.isEditing = true;
    this.zone = zone
    this.zoneForm.patchValue(zone);
  }

  deleteZone(index: number): void {
    this.zones.splice(index, 1);
  }

  onValueSelected(option: IOption): void {
  }
}
