import { Component, OnInit, OnDestroy } from "@angular/core";
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
export class DashboardComponent implements OnInit, OnDestroy { // Ensure OnDestroy is implemented

  totalCuts: number = 0
  totalInvoices: number = 0
  totalCustomer: number = 0
  totalReadings: number = 0
  userName: string | null = null;

  private refreshInterval = 30000; // Refresh data every 30 seconds
  private destroy$ = new Subject<void>(); // Used to manage RxJS subscriptions

  constructor(private store: Store<IAppState>, private auth: AuthService) {
  }

ngOnInit(): void {
  this.store.select(selectCutCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
    this.totalCuts = count;
  });

  this.store.select(selectClientCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
    this.totalCustomer = count;
  });

  this.store.select(selectReadingCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
    this.totalReadings = count;
  });

  this.store.select(selectInvoiceCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
    this.totalInvoices = count;
  });

  // Initial load
  this.loadCounts();

  // Refresh every 30s
  interval(this.refreshInterval).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadCounts());

  // Check session
  this.auth.checkSession().then(name => this.userName = name || null);
}

private loadCounts(): void {
  this.store.dispatch(loadCutsCount());
  this.store.dispatch(loadClientsCount());
  this.store.dispatch(loadReadingsCount());
  this.store.dispatch(loadInvoicesCount());
}
  /**
   * Lifecycle hook called before the component is destroyed.
   * Used to complete the destroy$ subject, which unsubscribes all ongoing RxJS subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
