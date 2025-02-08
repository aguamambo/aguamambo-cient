import { Injectable } from '@angular/core';
import { ToasterService } from './toaster.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  constructor(private toasterService: ToasterService) { }

  getErrorMessage(status: number, message: string) {
    switch (status) {
      case 400:
        this.toasterService.showError('A solicitação não pôde ser compreendida pelo servidor.', message)
        break;
      case 401:
        this.toasterService.showError('Você não está autorizado a acessar este recurso.', message)
        break;
      case 403:
        this.toasterService.showError('Acesso negado. Você não tem permissão para visualizar esta página.', message)
        break;
      case 404:
        this.toasterService.showError('Dados não encontrados. Por favor, verifique seus dados de entrada', message)
        break;
      case 500:
        this.toasterService.showError(`Ocorreu um erro no servidor. Tente novamente mais tarde.`, message)
        break;
      default:
        this.toasterService.showError('Servidor Indisponivel', message)
    }
  }

  getMessage(status: number, message: string) : string {
    switch (status) {
      case 200:
      case 201:
        return 'Operação realizada com sucesso.';

      case 400:
        return 'A solicitação não pôde ser compreendida pelo servidor.';

      case 401:
        return 'Você não está autorizado a acessar este recurso.';

      case 403:
        return 'Acesso negado. Você não tem permissão para visualizar esta página.';

      case 404:
        return 'Dados não encontrados. Por favor, verifique seus dados de entrada.';

      case 500:
        return 'Ocorreu um erro no servidor. Tente novamente mais tarde.';

      default:
        return 'Servidor Indisponível.';
    }
  }

}
