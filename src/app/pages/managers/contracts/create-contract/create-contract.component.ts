import { Component, ViewChild } from "@angular/core";  
import { IClient } from "src/app/models/client";
import { IClientMeter } from "src/app/models/clientMeter";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { Subject, Observable, takeUntil, filter, first, switchMap, EMPTY } from "rxjs";
import { GenericConfig } from "src/app/core/config/generic.config";
import { IContractType } from "src/app/models/contractType";
import { IOption } from "src/app/models/option";
import { IZone } from "src/app/models/zone";
import { AuthService } from "src/app/services/auth.service";
import { DialogService } from "src/app/services/dialog.service";
import { listAllZones, listAllContractTypes, listAllEnterprises, createClient, createClientMeter, createContract, listAllAvailableMeters, listAllClients } from "src/app/store";
import { selectClientIsSaving,  selectClientSuccessMessage, selectClientStatusCode, selectSelectedClient, selectClientError, selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectSelectedClientMeter, selectSelectedClientMeters } from "src/app/store/selectors/clientMeter.selectors";
import { selectContractIsSaving, selectContractError, selectSelectedContract } from "src/app/store/selectors/contract.selectors";
import { selectSelectedContractTypes } from "src/app/store/selectors/contractType.selectors";
import { selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors";


@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrl: './create-contract.component.css'
})
export class CreateContractComponent {
  // Propriedades para navegação entre abas
  activeTab: 'client' | 'contract' = 'client';

  // Formulários e Estados
  clientForm!: FormGroup;
  contractForm!: FormGroup;
  destroy$ = new Subject<void>();
  isClientSaving$!: Observable<boolean>;
  isZonesLoading$!: Observable<boolean>;
  isContractSaving$!: Observable<boolean>;
  clientError$!: Observable<Error | null>;
  contractError$!: Observable<Error | null>;
  clientSuccessMessage$!: Observable<string | null>;
  contractSuccessMessage$!: Observable<string | null>;

  // Dados para os formulários
  zoneData: IOption[] = [];
  contractTypeData: IOption[] = [];
  enterprisesData: IOption[] = [];
  clientData: IOption[] = [];
  meterData: IOption[] = [];

  // Listas de dados
  zoneList: IZone[] = [];
  contractTypeList: IContractType[] = [];
  enterprisesList: any[] = [];
  clientsList: IClient[] = [];
  meterList: IClientMeter[] = [];
  
  // Observables para carregar dados
  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getMeters$ = this.store.pipe(select(selectSelectedClientMeters));
  isAccordionOpen = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private _dialogService: DialogService,
    private generic: GenericConfig,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.checkSession();

    // Inicialização do Formulário de Cliente
    this.clientForm = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      phoneNumber: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      nuit: new FormControl(null),
      zoneId: new FormControl(null, [Validators.required]),
      alternativeNumber: new FormControl(),
      observation: new FormControl(),
      exemptFromFines: new FormControl(false),
      wantsReceiptSMS: new FormControl(true),
      wantsInvoiceSMS: new FormControl(true)
    });

    // Inicialização do Formulário de Contrato
    this.contractForm = this.fb.group({
      startDate: new FormControl(null, [Validators.required]),
      description: new FormControl(''),
      balance: new FormControl(0),
      contractStatus: new FormControl(1),
      clientId: new FormControl(null, [Validators.required]),
      meterId: new FormControl(null, [Validators.required]),
      contractTypeId: new FormControl(null, [Validators.required])
    });

    // Subscrição para estados globais
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isClientSaving$ = this.store.select(selectClientIsSaving);
    this.isContractSaving$ = this.store.select(selectContractIsSaving);
    this.clientSuccessMessage$ = this.store.select(selectClientSuccessMessage);

    // Carregamento de dados para todos os dropdowns
    this.loadAllData();
  }

  loadAllData() {
    this._dialogService.reset();

    // Carrega Zonas
    this.store.dispatch(listAllZones());
    this.getZonesByEnterpriseId$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
      if (zones) {
        this.zoneList = zones;
        this.zoneData = [
          { label: 'Seleccione...', value: '' },
          ...zones.map(zone => ({
            label: zone.designation,
            value: zone.zoneId
          }))
        ];
      }
    });

    // Carrega Tipos de Contrato
    this.store.dispatch(listAllContractTypes());
    this.getContractTypes$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.contractTypeList = response;
        this.contractTypeData = [
          { label: 'Seleccione...', value: '' },
          ...response.map(contract => ({
            label: contract.designation,
            value: contract.contractTypeId
          }))
        ];
      }
    });

    // Carrega Empresas (caso necessário)
    this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterprisesData = [
          ...enterprises.map(enterprise => ({
            label: enterprise.name,
            value: enterprise.enterpriseId
          }))
        ];
      }
    });

    // Carrega Clientes
    this.store.dispatch(listAllClients());
    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
      if (clients) {
        this.clientsList = clients;
        this.clientData = [
          { label: 'Seleccione...', value: '' },
          ...clients.map(client => ({
            label: client.name,
            value: client.clientId
          }))
        ];
      }
    });

    // Carrega Medidores
    this.store.dispatch(listAllAvailableMeters());
    this.getMeters$.pipe(takeUntil(this.destroy$)).subscribe((meters) => {
      if (meters) {
        this.meterList = meters;
        this.meterData = [
          { label: 'Seleccione...', value: '' },
          ...meters.map(meter => ({
            label: meter.meterId,
            value: meter.meterId
          }))
        ];
      }
    });
  }

  // Métodos de navegação
  selectTab(tab: 'client' | 'contract'): void {
    this.activeTab = tab;
  }

  // Métodos do Formulário de Cliente
  saveClient(): void {
    this._dialogService.reset();
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;
      const clientMeter = { brand: 'Agua Mambo', cubicMeters: 0 };
    
      this.store.dispatch(createClient({ client: clientData }));
      this.store.dispatch(createClientMeter({ clientMeter }));
      
      this.store.pipe(
        select(selectSelectedClient),
        filter(client => !!client),
        takeUntil(this.destroy$)
      ).subscribe(client => {
        if (client) {
          this._dialogService.open({
            title: 'Criação de Cliente e Contador',
            type: 'success',
            message: 'Cliente e Contador criados com sucesso!',
            isProcessing: false,
            showConfirmButton: false,
          });
          this.eraseClientForm();
          this.loadAllData(); // Recarrega os dados para atualizar as listas
        }
      });
    } else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor, preencha todos os campos obrigatórios do cliente.',
        isProcessing: false,
        showConfirmButton: false,
      });
    }
  }

  // Métodos do Formulário de Contrato
  saveContract(): void {
    this._dialogService.reset();
    if (this.contractForm.valid) {
      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guardamos as informações do contrato.',
        type: 'loading',
        isProcessing: true,
      });

      const contractData = this.contractForm.value;
      this.store.dispatch(createContract({ contract: contractData }));

      this.store.pipe(
        select(selectSelectedContract),
        filter(contract => !!contract),
        takeUntil(this.destroy$)
      ).subscribe(contract => {
        if (contract) {
          this._dialogService.open({
            title: 'Criação do Contrato',
            type: 'success',
            message: 'Contrato criado com sucesso!',
            isProcessing: false,
            showConfirmButton: false,
          });
          this.eraseContractForm();
          this.loadAllData(); // Recarrega os dados para atualizar as listas
        }
      });
    } else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor, verifique se os campos estão preenchidos corretamente e tente novamente.',
        isProcessing: false,
        showConfirmButton: false,
      });
    }
  }
  
  // Métodos de utilidade
  private showErrorDialog(error: any): void {
    this._dialogService.open({
      title: 'Erro',
      message: error?.message || 'Ocorreu um erro inesperado. Por favor, contacte a equipa técnica para suporte.',
      type: 'error',
      showConfirmButton: true,
      cancelText: 'Cancelar',
    });
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  onCheckboxValueChange(controlName: string, isChecked: boolean) {
    this.clientForm.get(controlName)?.setValue(isChecked);
  }

  onSelectChange(controlName: string, option: IOption): void {
    this.contractForm.get(controlName)?.setValue(option.value);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }
  
  eraseClientForm() {
    this._dialogService.reset();
    this.clientForm.reset();
    this.clientForm.get('exemptFromFines')?.setValue(false);
    this.clientForm.get('wantsReceiptSMS')?.setValue(true);
    this.clientForm.get('wantsInvoiceSMS')?.setValue(true);
  }

  eraseContractForm() {
    this._dialogService.reset();
    this.contractForm.reset();
    this.contractForm.get('balance')?.setValue(0);
    this.contractForm.get('contractStatus')?.setValue(1);
  }

  checkSession() {
    if (!this.auth.authenticated()) {
      this.auth.logout();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
