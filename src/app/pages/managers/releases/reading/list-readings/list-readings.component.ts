import { Component } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { IReading } from "src/app/models/reading";
import { AuthService } from "src/app/services/auth.service";
import { listAllReadings } from "src/app/store";
import { IAppState } from "src/app/store/reducers";
import { selectReadingErrorMessage, selectReadingIsLoading, selectSelectedReadings } from "src/app/store/selectors/reading.selectors";

@Component({
  selector: 'app-list-readings',
  templateUrl: './list-readings.component.html',
  styleUrl: './list-readings.component.css'
})
export class ListReadingsComponent {
   

  readingColumns: {key: keyof IReading;  label: string}[] = []
 
  readingsData: IReading[] = [];
  readingsList: IReading[] = []

  isReadingLoading$: Observable<boolean>;
  errorMessage$: Observable<string>; 
   
  getReadings$ = this.store.pipe(select(selectSelectedReadings))

  private destroy$ = new Subject<void>();

  constructor(private store: Store<IAppState>, private auth: AuthService) {
    this.isReadingLoading$ = this.store.select(selectReadingIsLoading);
    this.errorMessage$ = this.store.select(selectReadingErrorMessage);

    this.readingColumns = [
    {key: 'readingId', label: 'Id da Leitura'},
    {key: 'active', label: 'Cliente Activo'},
    {key: 'consumption', label: 'Consumo'},
    {key: 'dateChange', label: 'Data de Alteracao'},
    {key: 'dateCreated', label: 'Data de Criacao'},
    {key: 'currentReading', label: 'Leitura Acutal'},
    {key: 'lastReading', label: 'Leitura Anterior'},
    {key: 'readingMonth', label: 'Mês'},
    {key: 'readingYear', label: 'Ano Económico'},
    {key: 'state', label: 'Estado'},
    {key: 'meterId', label: 'Contador'},
    {key: 'userChange', label: 'Alterado por'},
    {key: 'userCreated', label: 'Criado por'}
    ]
  }

  ngOnInit(): void {
    this.checkSession()
     
    this.listReadings()
  }

  listReadings(){
    this.store.dispatch(listAllReadings())
    this.getReadings$.pipe(takeUntil(this.destroy$)).subscribe((readings) => {
      if (readings) {
        this.readingsList = readings;

        this.readingsData = readings.map(reading => ({
            readingId: reading.readingId, 
            active: reading.active, 
            consumption: reading.consumption, 
            dateChange: reading.dateChange, 
            dateCreated: reading.dateCreated, 
            currentReading: reading.currentReading, 
            lastReading: reading.lastReading, 
            readingMonth: reading.readingMonth, 
            readingYear: reading.readingYear, 
            state: reading.state, 
            meterId: reading.meterId, 
            userChange: reading.userChange, 
            userCreated: reading.userCreated
        }))
      }
    })
  }

  

  checkSession() {
    if (!this.auth.authenticated()) {
      this.auth.logout()
    }
  }

    

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
