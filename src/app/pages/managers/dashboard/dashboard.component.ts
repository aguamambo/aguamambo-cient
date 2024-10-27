import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject, interval, takeUntil } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { IAppState, loadCutsCount, loadClientsCount, loadReadingsCount, loadInvoicesCount } from "src/app/store";
import { selectClientCount } from "src/app/store/selectors/client.selectors";
import { selectCutCount } from "src/app/store/selectors/cut.selectors";
import { selectInvoiceCount } from "src/app/store/selectors/invoice.selectors";
import { selectReadingCount } from "src/app/store/selectors/reading.selectors";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  totalCuts: number = 0
  totalInvoices: number = 0
  totalCustomer: number = 0
  totalReadings: number = 0

  private refreshInterval = 30000;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<IAppState>, private auth: AuthService) {
  }
  ngOnInit(): void {
    
    this.checkSession()
    this.loadCounts();
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadCounts());
  }

  loadCounts() {
    this.store.dispatch(loadCutsCount());
    this.store.select(selectCutCount).pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.totalCuts = count;
    });

    this.store.dispatch(loadClientsCount());
    this.store.select(selectClientCount).pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.totalCustomer = count;
    });

    this.store.dispatch(loadReadingsCount());
    this.store.select(selectReadingCount).pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.totalReadings = count;
    });

    this.store.dispatch(loadInvoicesCount());
    this.store.select(selectInvoiceCount).pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.totalInvoices = count;
    });
  }

  ngOnDestroy(): void { 
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkSession() {
    if (!this.auth.authenticated()){
      this.auth.logout()
    }
  }
}
