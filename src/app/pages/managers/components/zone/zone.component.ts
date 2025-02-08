import { createZone, deleteZone, getZone, listAllZones, updateZone } from './../../../../store/actions/zone.actions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { delay, filter, finalize, Observable, pipe, Subject, takeUntil } from 'rxjs';
import { IEnterprise } from 'src/app/models/enterprise';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { DialogService } from 'src/app/services/dialog.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { IAppState, listAllEnterprises } from 'src/app/store';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedZone, selectSelectedZones, selectZoneErrorMessage, selectZoneIsLoading, selectZoneIsSaving } from 'src/app/store/selectors/zone.selectors';


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
  zonesColumns: { key: keyof IZone; label: string }[] = [];
  isZonesLoading$: Observable<boolean>;
  isZoneSaving$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isEditing: boolean = false;
  editIndex: number | null = null;
  private destroy$ = new Subject<void>();

  getEnterprises$ = this._store.pipe(select(selectSelectedEnterprises));
  getZones$ = this._store.pipe(select(selectSelectedZones));


  constructor(
    private _fb: FormBuilder,
    private _store: Store<IAppState>,
    private _dialogService: DialogService,
    private _toaster: ToasterService
  ) {
    this.zoneForm = this._fb.group({
      zoneId: [''],
      designation: ['', Validators.required],
      description: ['', Validators.required],
      enterpriseId: ['', Validators.required],
    });

    this.isZonesLoading$ = this._store.select(selectZoneIsLoading);
    this.isZoneSaving$ = this._store.select(selectZoneIsSaving);
    this.isEnterprisesLoading$ = this._store.select(selectEnterpriseIsLoading);

    this.zonesColumns = [
      { key: 'zoneId', label: 'Código' },
      { key: 'designation', label: 'Nome' },
      { key: 'description', label: 'Descrição' },
      { key: 'enterpriseName', label: 'Empresa' }
    ]
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this._store.dispatch(listAllZones());
    this._store.dispatch(listAllEnterprises());

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

  submitZoneForm(): void {

    if (this.zoneForm.valid) {

      const payload = this.zoneForm.value;

      if (this.isEditing) {
        this._store.dispatch(updateZone({ zoneId: payload.zoneId, zone: payload }));
        this._store.pipe(select(selectZoneErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Actualizacao da Zona',
                type: 'error',
                message: 'Um erro ocorreu ao actualizar a Zona! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
              })
            } else {
              this._store.pipe(select(selectSelectedZones), filter((zone) => !!zone))
                .subscribe((zone) => {
                  if (zone) {
                    this.eraseForm();
                    this.isEditing = false;
                    this._dialogService.open({
                      title: 'Actualizacao da Zona',
                      type: 'success',
                      message: 'Zona Actualizado com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    })
                  }
                });
            }
          }
        )
      } else {
        this._store.dispatch(createZone({ zone: payload }));
        this._store.pipe(select(selectZoneErrorMessage)).subscribe(
          error => {
            if (error) {
              this._dialogService.open({
                title: 'Criação da Zona',
                type: 'error',
                message: 'Um erro ocorreu ao criar a Zona! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                isProcessing: false,
                showConfirmButton: false,
              })
            } else {
              this._store.pipe(select(selectSelectedZone), filter((zone) => !!zone))
                .subscribe((zone) => {
                  if (zone) {
                    this._dialogService.open({
                      title: 'Criação de Zona',
                      type: 'success',
                      message: 'Zona criada com sucesso!',
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

  delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  private showMessage(title: string, message: string): void {
  }

  deleteZone(index: number): void {
    const zoneToDelete = this.zones[index];

    this._dialogService.open({
      title: 'Delete Zone',
      type: 'info',
      message: `Are you sure you want to delete the zone "${zoneToDelete.designation}"?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    }).subscribe((confirmed) => {
      if (confirmed) {
        this._store.dispatch(deleteZone({ zoneId: zoneToDelete.zoneId }));
        this._toaster.showSuccess('Zone deleted successfully.');
      }
    });
  }

  
  eraseForm(){
    this.zoneForm.reset();
  }

  openFeedbackDialog(type: 'success' | 'error', title: string, message: string): void {
    this._dialogService.open({
      title: title,
      message: message,
      type: type,
      confirmText: 'OK',
      isProcessing: false,
    })
  }


  editzone(zone: IZone): void {
    this.isEditing = true;
    this.zone = zone
    this.zoneForm.patchValue({
      zoneId: this.zone.zoneId,
      designation: this.zone.designation,
      description: this.zone.description,
      enterpriseId: this.zone.enterpriseId,
      enterpriseName: this.zone.enterpriseName
    });
  }

  onValueSelected(option: IOption): void {
  }
}
