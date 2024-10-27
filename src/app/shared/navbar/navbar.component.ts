import { Component, EventEmitter, Output, Renderer2 } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent  {
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() modeToggle = new EventEmitter<{isDark: boolean, logo:string}>();

  currentLogo = '../../../assets/img/EAgua.png'

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;  
     this.sidebarToggle.emit();   
  }

  
  isSidebarOpen = false;
  isDarkMode = false; 
  isProfileMenuOpen = false;

  userName: string | null  = '';
  userRole: string | null  = '';

  constructor(private renderer: Renderer2, private router: Router, private authService: AuthService) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';

    this.updateTheme();
    this.getUserInfo();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme(); 
    this.currentLogo = this.isDarkMode ? '../../../assets/img/EAgua_2.png' : '../../../assets/img/EAgua_1.png'
    this.modeToggle.emit({isDark: this.isDarkMode, logo: this.currentLogo})
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  updateTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  getUserInfo(){ 
    const user = this.getData('name');
    const role = this.getData('role');
    if (user) {
      this.userName = this.authService.decryptData(user)
    }
    
    if (role) {
      switch (this.authService.decryptData(role).toLowerCase()){
        case 'field_tech':
          this.userRole = 'Técnico'
          break;
          case 'admin': 
          this.userRole = 'Administrador'
          break;
      }
    }
    
  }

  getData(data: string): string{
    return localStorage.getItem(data) || ''
  }

  signout(){
    localStorage.clear(); 
    this.router.navigateByUrl('/auth/login')
    this.isProfileMenuOpen = false
  }

  settings(){
    this.router.navigateByUrl('manager/settings')
    this.isProfileMenuOpen = false
  }
}