import { Component, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  url?: string;
  restrict?: boolean;
  isOpen: boolean;
  subMenu?: { 
    label: string; 
    url?: string; 
    subMenuOptions?: { 
      restrict?: boolean;
      label: string; 
      url: string
    }[]; 
    isOpen: false;
  }[];
}

@Component({
  selector: 'app-side-bar', 
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
@Input() isSidebarOpen: boolean = false; 
@Output() sidebarToggle = new EventEmitter<void>(); 
@Input() logo: string = '';
 
  isDarkMode = false; 
  isMenuVisible = false; 
  profile: string | undefined = ''
  menuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        url:'manager/dashboard',
        icon:  'M540-600v-200h260v200H540ZM160-480v-320h260v320H160Zm380 320v-320h260v320H540Zm-380 0v-200h260v200H160Zm40-360h180v-240H200v240Zm380 320h180v-240H580v240Zm0-440h180v-120H580v120ZM200-200h180v-120H200v120Zm180-320Zm200-120Zm0 200ZM380-320Z',
        isOpen: false
    },
     {
        label: 'Lançamento', 
        icon:  'M224.62-160q-26.85 0-45.74-18.88Q160-197.77 160-224.62v-510.76q0-26.85 18.88-45.74Q197.77-800 224.62-800h510.76q26.85 0 45.74 18.88Q800-762.23 800-735.38v238q-10.54-3.62-20.15-5.89-9.62-2.27-19.85-4.5v-227.61q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H224.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v510.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h226.61q1.46 11.23 3.73 20.85 2.27 9.61 5.89 19.15H224.62ZM200-240v40-560V-507.77v-3V-240Zm100-69.23h158.38q2.24-10.23 6.04-19.85 3.81-9.61 7.96-20.15H300v40ZM300-460h263.23q19.69-13.85 38.81-23.46 19.11-9.62 41.04-15.08V-500H300v40Zm0-150.77h360v-40H300v40ZM720-75.38q-66.85 0-113.42-46.58Q560-168.54 560-235.38q0-66.85 46.58-113.43 46.57-46.57 113.42-46.57t113.42 46.57Q880-302.23 880-235.38q0 66.84-46.58 113.42Q786.85-75.38 720-75.38ZM704.62-120h30.76v-100h100v-30.77h-100v-100h-30.76v100h-100V-220h100v100Z',
        isOpen: false,
        subMenu: [
            {
                label: 'Leituras', 
                subMenuOptions: [
                    { label: 'Registar Leitura', url: 'releases/readings/add' },
                    { label: 'Listar Leituras', url: 'releases/readings/list' }
                ], 
                isOpen: false
            },
            {
                label: 'Clientes',                 
                subMenuOptions: [
                    { label: 'Registar Cliente', url: 'releases/customers/add', restrict: this.isMenuVisible },
                    { label: 'Listar Clientes', url: 'releases/customers/list' }
                ],
                isOpen: false
            },
            {
                label: 'Suspensão', 
                subMenuOptions: [
                    { label: 'Registar Suspensão', url: 'releases/suspensions/add', restrict: this.isMenuVisible },
                    { label: 'Listar Suspensões', url: 'releases/suspensions/list' }
                ],
                isOpen: false
            },
            {
                label: 'Cortes',
                subMenuOptions: [
                    { label: 'Registar Corte', url: 'releases/cuts/add', restrict: this.isMenuVisible },
                    { label: 'Lista de Cortes', url: 'releases/cuts/list' }
                ],
                isOpen: false
            }
        ]
    },
    {
        label: 'Tesouraria', 
        icon:  'M260-380h331.54l40-40H260v40Zm0-160h200v-40H260v40ZM160-680v400h331.54l-40 40H120v-480h720v131.54h-40V-680H160Zm702.15 198.15q4.23 4.23 4.23 9.47 0 5.23-4.23 9.46l-31.38 31.38-31.54-31.54 31.39-31.38q4.23-4.23 9.46-4.23t9.46 4.23l12.61 12.61ZM532.31-163.08v-31.54l244.46-244.46 31.54 31.54-244.46 244.46h-31.54ZM160-680v400-400Z',
        isOpen: false,
        subMenu: [
            {
                label: 'Factura', 
                subMenuOptions: [
                    { label: 'Nova Factura', url: 'treasuries/invoices/add' },
                    { label: 'Listar Facturas', url: 'treasuries/invoices/list' }
                ],
                isOpen: false
            },
            {
                label: 'Recibo', 
                subMenuOptions: [
                    { label: 'Novo Recibo', url: 'treasuries/receipts/add' },
                    { label: 'Listar Recibos', url: 'treasuries/receipts/list' }
                ],
                isOpen: false
            }
        ]
    },
    {
        label: 'Relatórios',
        url:'manager/reports',
        icon:  'M340-500v-40h280v40H340Zm0-160v-40h280v40H340ZM240-380h300q24.38 0 44.77 10.58 20.38 10.57 35.08 29.73l100.15 130v-565.69q0-10.77-6.92-17.7-6.93-6.92-17.7-6.92H264.62q-10.77 0-17.7 6.92-6.92 6.93-6.92 17.7V-380Zm24.62 220h442.76l-119-155.31q-9.07-11.84-21.42-18.27Q554.62-340 540-340H240v155.38q0 10.77 6.92 17.7 6.93 6.92 17.7 6.92Zm430.76 40H264.62q-27.62 0-46.12-18.5Q200-157 200-184.62v-590.76q0-27.62 18.5-46.12Q237-840 264.62-840h430.76q27.62 0 46.12 18.5Q760-803 760-775.38v590.76q0 27.62-18.5 46.12Q723-120 695.38-120ZM240-160v-640 640Zm0-180v-40 40Z',
        isOpen: false 
    },
    {
        label: 'Paramertização',
        url:'manager/setup',
        icon:  'M460-140v-200h40v80h320v40H500v80h-40Zm-320-80v-40h200v40H140Zm160-160v-80H140v-40h160v-80h40v200h-40Zm160-80v-40h360v40H460Zm160-160v-200h40v80h160v40H660v80h-40Zm-480-80v-40h360v40H140Z',
        isOpen: false
    },
    {
        label: 'Backup',
        url:'manager/backups',
        icon:  'M260-200q-74.85 0-127.42-52.06Q80-304.11 80-379.31q0-71.07 48.92-123.23 48.93-52.15 114.93-56.08Q257.31-646 324.23-703q66.92-57 155.77-57 100.29 0 170.14 69.86Q720-620.29 720-520v40h24.62q57.46 1.85 96.42 42.19Q880-397.46 880-340q0 58.85-39.81 99.42Q800.38-200 741.54-200H524.62q-27.62 0-46.12-18.5Q460-237 460-264.62v-232.15l-84 83.54-28.31-27.54L480-573.08l132.31 132.31L584-413.23l-84-83.54v232.15q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69H740q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-21.54q-55.69 0-97.08 41Q120-438 120-380t41 99q41 41 99 41h100v40H260Zm220-260Z',
        isOpen: false
    }
];

constructor(private renderer: Renderer2, private router: Router) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    
    this.profile = localStorage.getItem('role')?.toString()

    if (this.profile && this.profile.toLowerCase() === 'admin') {
      this.isMenuVisible = true
    }

    this.updateTheme();
  }

toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  updateTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {      
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  isActiveRoute(url: string | undefined): boolean {
    return this.router.url === url;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; 
    this.sidebarToggle.emit(); 
     
  }
 
  toggleSubMenu(menu: MenuItem): void {
    if (menu.subMenu && menu.subMenu.length > 0) {
      menu.isOpen = !menu.isOpen;
    } else if (menu.url) { 
        this.router.navigate([menu.url]);
    }
  }

  toggleSecondLevelSubMenu(subMenu: any) {
    subMenu.isOpen = !subMenu.isOpen;
  }
}