import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastMessage, ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.css'
})
export class ToasterComponent implements OnInit, OnDestroy {
  toastMessage: ToastMessage | null = null;
  private subscription!: Subscription;

  constructor(private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.subscription = this.toasterService.getToastMessage().subscribe((message) => {
      this.toastMessage = message;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}