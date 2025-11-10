import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {
 
  @Input() showDetailsCard: boolean = false;
  @Input() clientDetatils: { label: string; value: string; icon: string; color: string }[] = [];

  ngOnInit() {
    console.log(this.clientDetatils);
  }
  
}
