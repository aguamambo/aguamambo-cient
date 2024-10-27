import { Injectable } from '@angular/core';
import { ToasterService } from './toaster.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  constructor(private toasterService: ToasterService) { }

  getErrorMessage(status: number) {
    switch (status) {
      case 400:
        this.toasterService.showError('A solicitação não pôde ser compreendida pelo servidor.')
        break;
      case 401:
        this.toasterService.showError('Você não está autorizado a acessar este recurso.')
        break;
      case 403:
        this.toasterService.showError('Acesso negado. Você não tem permissão para visualizar esta página.')
        break;
      case 404:
        this.toasterService.showError('Dados não encontrados. Por favor, verifique seus dados de entrada')
        break;
      case 500:
        this.toasterService.showError('Ocorreu um erro no servidor. Tente novamente mais tarde.')
        break;
      default:
        this.toasterService.showError('Servidor Indisponivel')
    }
  }
}
