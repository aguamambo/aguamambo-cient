import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { SideBarComponent } from './side-bar/side-bar.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { StatsComponent } from './components/stats/stats.component';
import { ButtonComponent } from './components/button/button.component';
import { TableComponent } from './components/table/table.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CustomSelectComponent } from './components/custom-select/custom-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ToasterComponent } from './components/toaster/toaster.component';
import { AutocompleteInputComponent } from './components/autocomplete-input/autocomplete-input.component';
import { CustomDropDownComponent } from './components/custom-drop-down/custom-drop-down.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { CardComponent } from './components/card/card.component';
import { TabComponent } from './components/tab/tab.component';
import { TabItemComponent } from './components/tab-item/tab-item.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component'; 
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
  declarations: [ 
    SideBarComponent, 
    NavbarComponent, 
    StatsComponent, 
    ButtonComponent, 
    TableComponent, 
    PaginationComponent, 
    BreadcrumbComponent, 
    CustomSelectComponent, 
    LoadingSpinnerComponent, 
    ToasterComponent, 
    AutocompleteInputComponent, 
    CustomDropDownComponent, 
    CheckboxComponent, 
    DatePickerComponent, 
    CardComponent, 
    TabComponent, 
    TabItemComponent, 
    PdfViewerComponent,  
    DialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule 
  ],
  exports: [
    SideBarComponent,
    ToasterComponent, 
    NavbarComponent, 
    StatsComponent, 
    ButtonComponent, 
    TableComponent, 
    PaginationComponent, 
    BreadcrumbComponent, 
    CustomSelectComponent, 
    LoadingSpinnerComponent, 
    AutocompleteInputComponent, 
    CustomDropDownComponent,
    CheckboxComponent,
    DatePickerComponent,
    CardComponent,
    TabComponent,
    TabItemComponent,
    PdfViewerComponent,  
    DialogComponent
  ]
})
export class SharedModule { }
