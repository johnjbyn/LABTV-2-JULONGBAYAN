import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-mobile-footer',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mobile-footer.html',
  styleUrls: ['./mobile-footer.css']
})
export class MobileFooterComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery: string = '';
  isMobile: boolean = false;
  isPopupOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    this.checkPopupStatus();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    setInterval(() => {
      this.checkPopupStatus();
    }, 1000);
    
    const observer = new MutationObserver(() => {
      this.checkPopupStatus();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    this.checkPopupStatus();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    this.checkPopupStatus();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.checkScreenSize();
    this.checkPopupStatus();
  }

  private checkPopupStatus() {
    const popup = document.querySelector('.modal, .popup, .movie-detail-modal, .modal-content, .movie-popup, .wide-popup, .popup-overlay');
    const isVisible = popup !== null && 
      (popup as HTMLElement).style.display !== 'none' && 
      (popup as HTMLElement).style.visibility !== 'hidden' &&
      !(popup as HTMLElement).classList.contains('hidden');
    
    this.isPopupOpen = isVisible;
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
    }
  }

  toggleLanguage() {
  }

  handleUserAction() {
    if (this.currentUser) {
      this.authService.logout();
      // Naviga alla pagina di login dopo il logout
      this.router.navigate(['/login']);
    } else {
      // Naviga alla pagina di login se non è loggato
      this.router.navigate(['/login']);
    }
  }
}
