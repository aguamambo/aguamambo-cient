import { Component, ViewChild } from "@angular/core";
import { ClientComponent } from "../client/client.component";
import { ContractComponent } from "../contract/contract.component";
import { MeterComponent } from "../meter/meter.component";
import { IClient } from "src/app/models/client";
import { IClientMeter } from "src/app/models/clientMeter";


@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrl: './create-contract.component.css'
})
export class CreateContractComponent {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isClientSaved: boolean = false;
  isMeterSaved: boolean = false;
  isContractSaved: boolean = false;

  selectedEnterpriseId: string = ''
  selectedZoneId: string = ''
  savedClient!: IClient;
  savedMeter!: IClientMeter;

  @ViewChild(ClientComponent) clientComponent!: ClientComponent;
  @ViewChild(MeterComponent) meterComponent!: MeterComponent;
  @ViewChild(ContractComponent) contractComponent!: ContractComponent;

  currentStep = 1;
  buttonDisabled = false;
  clientId = '';

  nextStep() {
      if (this.buttonDisabled) return;

      this.buttonDisabled = true;

      if (this.currentStep === 1) {
        this.clientComponent.saveClient();
      } else if (this.currentStep === 2) {
        if (this.savedClient) {
          
          this.meterComponent.saveMeter(this.savedClient.clientId);
        }
      } else if (this.currentStep === 3) { 
        this.contractComponent.saveContract();
      }
  
      if (this.currentStep < 3) {
        this.currentStep++;
      }

      setTimeout(() => {
        this.buttonDisabled = false;
      }, 200);
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onClientSaved(client: IClient) {    
    if (client && client.clientId && !this.isClientSaved) {
      this.isClientSaved = true;
      this.clientId = client.clientId;
      this.savedClient = client;  
      this.successMessage = "Cliente salvo com sucesso!";
      this.nextStep();
    }
  }

  onMeterSaved(meter: IClientMeter) {
    if (!this.isMeterSaved) {
      if (meter) {
        this.isMeterSaved = true;
        this.savedMeter = meter;  
        this.successMessage = "Medidor salvo com sucesso!";
        this.nextStep();
      }
    }
  }

  onContractSaved() {
    this.successMessage = "Contrato salvo com sucesso!";
    this.nextStep();
  }


}