import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Store } from "@ngrx/store";
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle } from "ng-apexcharts";
import { Subject, takeUntil, interval } from "rxjs";
import { InvoicePayment } from "src/app/models/invoice";
import { IOption } from "src/app/models/option";
import { AuthService } from "src/app/services/auth.service";
import { IAppState, loadInvoicesByZone, loadCutsCount, loadClientsCount, loadReadingsCount, loadInvoicesCount } from "src/app/store";
import { selectClientCount } from "src/app/store/selectors/client.selectors";
import { selectCutCount } from "src/app/store/selectors/cut.selectors";
import { selectInvoiceCount, selectInvoicesByZone } from "src/app/store/selectors/invoice.selectors";
import { selectReadingCount } from "src/app/store/selectors/reading.selectors";


export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Icons
  cutIcon: string = "m775.38-138.46-292.3-292.31L358.31-306q8.77 15 12.92 31.62 4.15 16.61 4.15 34.38 0 54.58-38.84 93.44-38.84 38.87-93.38 38.87-54.54 0-93.47-38.84-38.92-38.85-38.92-93.39t38.86-93.46q38.87-38.93 93.45-38.93 17.77 0 34.38 4.16 16.62 4.15 31.62 12.92L433.85-480 309.08-604.77q-15 8.77-31.62 12.92-16.61 4.16-34.38 4.16-54.58 0-93.45-38.84-38.86-38.85-38.86-93.39t38.84-93.46q38.84-38.93 93.39-38.93 54.54 0 93.46 38.87 38.92 38.86 38.92 93.44 0 17.77-4.15 34.38Q367.08-669 358.31-654l490.92 490.92v24.62h-73.85ZM584.62-532.31l-49.24-49.23 240-240h73.85v24.62L584.62-532.31Zm-341.54-95.38q38.07 0 65.19-27.12 27.11-27.11 27.11-65.19t-27.11-65.19q-27.12-27.12-65.19-27.12-38.08 0-65.2 27.12-27.11 27.11-27.11 65.19t27.11 65.19q27.12 27.12 65.2 27.12Zm240 147.69Zm-240 332.31q38.07 0 65.19-27.12 27.11-27.11 27.11-65.19t-27.11-65.19q-27.12-27.12-65.19-27.12-38.08 0-65.2 27.12-27.11 27.11-27.11 65.19t27.11 65.19q27.12 27.12 65.2 27.12Z";
  readingIcon: string = "M240-120q-33.85 0-56.92-23.08Q160-166.15 160-199.64V-280h120v-544.62l50.77 35.39 52.31-35.39 52.3 35.39 52.31-35.39L540-789.23l52.31-35.39 52.31 35.39 52.3-35.39 52.31 35.39L800-824.62V-200q0 33.85-23.08 56.92Q753.85-120 720-120H240Zm480-40q17 0 28.5-11.5T760-200v-560H320v480h360v80q0 17 11.5 28.5T720-160ZM375.38-620v-40h213.85v40H375.38Zm0 120v-40h213.85v40H375.38Zm300-109.23q-12.38 0-21.57-9.19-9.19-9.2-9.19-21.58 0-12.38 9.19-21.58 9.19-9.19 21.57-9.19 12.39 0 21.58 9.19 9.19 9.2 9.19 21.58 0 12.38-9.19 21.58-9.19 9.19-21.58 9.19ZM240-160h400v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z";
  invoiceIcon: string = "M340-260h280v-40H340v40Zm0-160h280v-40H340v40Zm-75.38 300q-27.62 0-46.12-18.5Q200-157 200-184.62v-590.76q0-27.62 18.5-46.12Q237-840 264.62-840H580l180 180v475.38q0 27.62-18.5 46.12Q723-120 695.38-120H264.62ZM560-640v-160H264.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v590.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h430.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93V-640H560ZM240-800v160-160 640-640Z";
  customerIcon: string = "M675.38-415.38q-32.76 0-56.38-23.62-23.62-23.62-23.62-56.38 0-32.77 23.62-56.39 23.62-23.61 56.38-23.61 32.77 0 56.39 23.61 23.61 23.62 23.61 56.39 0 32.76-23.61 56.38-23.62 23.62-56.39 23.62Zm-180 200v-36q0-18.62 9.3-33.76 9.29-15.14 26.4-21.78 33.79-14.23 69.93-21.35 36.14-7.11 74.37-7.11 36.68 0 72.88 7.11 36.2 7.12 71.43 21.35 17.1 6.64 26.4 21.78 9.29 15.14 9.29 33.76v36h-360ZM384.62-504.62q-49.5 0-84.75-35.25t-35.25-84.75q0-49.5 35.25-84.75t84.75-35.25q49.5 0 84.75 35.25t35.25 84.75q0 49.5-35.25 84.75t-84.75 35.25Zm0-120Zm-280 409.24v-65.85q0-25.95 14.3-47.71 14.31-21.75 38.93-32.14 53.07-26.92 110.23-40.61 57.16-13.69 116.54-13.69 24.23 0 48.46 2.53 24.23 2.54 48.46 6.7l-17.08 17.84q-8.54 8.93-17.08 17.85-15.69-3.08-31.38-4-15.69-.92-31.38-.92-54.16 0-106.97 11.69Q224.85-352 176.92-326q-13.07 7.31-22.69 18.23-9.61 10.92-9.61 26.54v25.85h240v40h-280Zm280-40Zm0-289.24q33 0 56.5-23.5t23.5-56.5q0-33-23.5-56.5t-56.5-23.5q-33 0-56.5 23.5t-23.5 56.5q0 33 23.5 56.5t56.5 23.5Z";

  form = this._fb.group({
  enterpriseId: [null],
  period: ['thisMonth'],
  region: ['all']
});

  // KPI Values
  totalCuts = 0;
  totalInvoices = 0;
  totalCustomers = 0;
  totalReadings = 0;
  previousCuts = 0;
  cutChange = 0;
  estimatedInvoices = 0;
 
  invoiceColumns!: {label: string;  key: keyof InvoicePayment}[]

  // Filters
  selectedPeriod = 'thisMonth';
  selectedRegion = 'all';
  periodOptions = [
    { label: 'Este mês', value: 'thisMonth' },
    { label: 'Últimos 3 meses', value: 'last3Months' },
    { label: 'Últimos 6 meses', value: 'last6Months' },
  ];
  regionOptions = [
    { label: 'Todas', value: 'all' },
    { label: 'Norte', value: 'north' },
    { label: 'Sul', value: 'south' },
  ];

  // Chart
  chartOptions!: ChartOptions;

  // Recent invoices (mock)
 

  
  recentInvoices  = [
  {
    invoiceId: 1,
    description: 'Água Junho',
    paymentMethod: 'Mpesa',
    limitDate: '2024-06-30',
    paymentStatus: 'Pago',
    paymentDate: '2024-06-28',
    amount: 250,
    fineAmount: 0,
    totalAmount: 250,
    finePercentage: 0,
    readingId: 1024
  },
  {
    invoiceId: 2,
    description: 'Água Julho',
    paymentMethod: 'BIM',
    limitDate: '2024-07-31',
    paymentStatus: 'Pendente',
    paymentDate: null,
    amount: 300,
    fineAmount: 15,
    totalAmount: 315,
    finePercentage: 5,
    readingId: 1025
  }
];

  userName: string | null = null;
  private refreshInterval = 120000;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<IAppState>, private auth: AuthService, private _fb: FormBuilder,) {
   this.invoiceColumns  = [
  { label: 'ID' , key: 'invoiceId'},
  { label: 'Descritivo' , key: 'description'},
  { label: 'Metodo de Pagamento' , key: 'paymentMethod'},
  { label: 'Data Limite' , key: 'limitDate'},
  { label: 'Estado' , key: 'paymentStatus'},
  { label: 'Data de Pagamento' , key: 'paymentDate'},
  { label: 'Valor da Leitura' , key: 'amount'},
  { label: 'Multa' , key: 'fineAmount'},
  { label: 'Valor a Pagar' , key: 'totalAmount'},
  { label: 'Multa (%)' , key: 'finePercentage'},
  { label: 'Leitura', key: 'readingId' }
];
  }

  ngOnInit(): void {
    this.store.select(selectCutCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.previousCuts = this.totalCuts;
      this.totalCuts = count;
      this.updateCutChange();
    });

    this.store.select(selectClientCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.totalCustomers = count;
    });

    this.store.select(selectReadingCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.totalReadings = count;
    });

    this.store.select(selectInvoiceCount).pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.totalInvoices = count;
      this.estimatedInvoices = this.totalInvoices * 2; // example logic
    });

    this.store.select(selectInvoicesByZone).subscribe(data => {
      if (data) {
        this.chartOptions = {
          series: [{ name: 'Faturas', data: data.map(item => item.total) }],
          chart: { type: 'bar', height: 350 },
          title: { text: 'Faturas por Zona' },
          xaxis: { categories: data.map(item => item.zone) },
          dataLabels: { enabled: true }
        };
      }
    });

    this.loadCounts();
    interval(this.refreshInterval).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadCounts());
    this.auth.checkSession().then(name => this.userName = name || null);
  }

  private updateCutChange(): void {
    this.cutChange = this.previousCuts === 0 ? 0 :
      +(((this.totalCuts - this.previousCuts) / this.previousCuts) * 100).toFixed(1);
  }

  private loadCounts(): void {
    this.store.dispatch(loadInvoicesByZone());
    this.store.dispatch(loadCutsCount());
    this.store.dispatch(loadClientsCount());
    this.store.dispatch(loadReadingsCount());
    this.store.dispatch(loadInvoicesCount());
  }

  onPeriodChange(option: IOption) {
  this.selectedPeriod = option.value;
}

onRegionChange(option: IOption) {
  this.selectedRegion = option.value;
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}