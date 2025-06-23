import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, first, skipWhile } from 'rxjs';
import { IClient } from 'src/app/models/client';
import { IOption } from 'src/app/models/option';
import { IRubric, IClientRubric } from 'src/app/models/rubric';
import { DialogService } from 'src/app/services/dialog.service';
import { IAppState, listAllClients, listAllRubrics } from 'src/app/store';
import { createClientRubric, getClientRubric, getClientRubricsByClientId, listAllClientRubrics, resetClientRubricActions } from 'src/app/store/actions/clientRubrics.actions';
import { selectAllClients } from 'src/app/store/reducers/client.reducers';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectClientRubricErrorMessage, selectSelectedClientRubric, selectSelectedClientRubrics } from 'src/app/store/selectors/clientRubrics.selectors';
import { selectSelectedRubrics } from 'src/app/store/selectors/rubric.selectors';

@Component({
  selector: 'app-other-payments',
  templateUrl: './other-payments.component.html',
  styleUrl: './other-payments.component.css'
})
export class OtherPaymentsComponent implements OnInit {
  clientData: IOption[] = [];
  clientList: IClient[] = [];
  clientRubricList: IClientRubric[] = [];
  rubricData: IOption[] = [];
  rubricList: IRubric[] = [];
  selectedClient: string = ''
  selectedRubric: string = ''
  iconPath: string = ''
  rubrics: IClientRubric[] = [];
  rubricColumns: { key: keyof IClientRubric; label: string }[] = [];

  constructor(private _store: Store<IAppState>, private _dialogService: DialogService) {

    this.rubricColumns = [
      { key: 'id', label: 'ID' },
      { key: 'clientName', label: 'Cliente' },
      { key: 'quantity', label: 'Quantidade' },
      { key: 'description', label: 'Rubrica' },
      { key: 'createdAt', label: 'Data de Cobrança' },
    ]
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this._dialogService.open({
      title: 'Processando',
      message: 'Aguarde um instante enquanto guarda ainformações da Rubricas.',
      type: 'loading',
      isProcessing: true,
    });
    this.loadClients()
    this.loadRubrics()
  }

  loadClientRubrics(clientId: string) {
    this._store.dispatch(getClientRubricsByClientId({ clientId }));

    this._store.pipe(
      select(selectSelectedClientRubrics),
      skipWhile((rubrics) => !rubrics),
      first()
    ).subscribe((clientRubrics) => {
      if (clientRubrics) {
        const enrichedClientRubrics: IClientRubric[] = clientRubrics.map(cr => {
          const rubric = this.rubricList.find(r => r.rubricId === cr.rubricId);
          const client = this.clientList.find(c => c.clientId === cr.clientId);

          return {
            ...cr,
            description: rubric?.description || 'Descrição não encontrada',
            clientName: client?.name || 'Cliente não encontrado',
            createdAt: this.formatDateTime(cr.createdAt)
          };
        });

        this.clientRubricList = enrichedClientRubrics;
      }
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // mês começa do zero
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  loadClients() {
    this._store.dispatch(listAllClients())
    this._store.pipe(select(selectSelectedClients), skipWhile((client) => !client), first()).subscribe((clients) => {
      if (clients) {
        this.clientList = clients

        this.clientData = [
          { label: 'Seleccione...', value: '' },
          ...clients.map(client => ({ label: client.name, value: client.clientId }))
        ]
        this._dialogService.close()
      }
    })
  }
 

  loadRubrics() {
    
    this._store.dispatch(listAllRubrics())
    this._store.pipe(select(selectSelectedRubrics), skipWhile((rubrics) => !rubrics), first()).subscribe((rubrics) => {
      if (rubrics) {
        this.rubricList = rubrics

        this.rubricData = [
          { label: 'Seleccione...', value: '' },
          ...rubrics.map(rubric => ({ label: rubric.name, value: rubric.rubricId }))
        ]
      
      }
    })
  }


  onClientSelected($event: IOption) {
    this.selectedClient = $event.value
    this._store.dispatch(resetClientRubricActions())
    this.loadClientRubrics(this.selectedClient)
  }

  onRubricSelected($event: IOption) {
    this.selectedRubric = $event.value
  }

  submitPaymentk() {
    const payload = {
      clientId: this.selectedClient,
      rubricId: this.selectedRubric,
      quantity: 1
    }

    if (this.selectedClient && this.selectedRubric) {
      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda ainformações do pagamento.',
        type: 'loading',
        isProcessing: true,
      });
      this._store.dispatch(createClientRubric({ payload }))
      this._store.pipe(select(selectClientRubricErrorMessage)).subscribe(error => {
        if (error) {
          this._dialogService.open({
            title: 'Outros Pagamentos',
            type: 'error',
            message: 'Um erro ocorreu ao efectuar a cobrança! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
            isProcessing: false,
            showConfirmButton: false,
            errorDetails: error
          })
        } else {
          this._store.pipe(
            select(selectSelectedClientRubric),
            filter((rubric) => !!rubric),
            first()
          ).subscribe({
            next: (receipt) => {
              if (receipt) {
                this._dialogService.open({
                  title: 'Sucesso',
                  message: 'Pagamento feito com sucesso!',
                  type: 'success'
                });
              }
            }

          })
        }
      }
      )
    } else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor verifique se os campos estão devidadmente preenchidos e volte a submeter.',
        isProcessing: false,
        showConfirmButton: false,
      })
    }

  }

}
