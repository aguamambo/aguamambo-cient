import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-manager-layout', 
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css'
})
export class ManagerLayoutComponent {
  isSidebarOpen = false;
  isDarkMode = false;
  currentLogo: string = '../../../assets/img/EAgua_1.png';

  @Output() sidebarToggle = new EventEmitter<boolean>();  

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onModeToggle(event: { isDark: boolean, logo: string }) {
    this.isDarkMode = event.isDark;
    this.currentLogo = event.logo;

  }
}
