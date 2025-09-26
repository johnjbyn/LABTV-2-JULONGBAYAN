import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseService, Purchase } from '../../services/purchase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule],
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class PurchasesComponent implements OnInit {
  purchases: Purchase[] = [];
  isLoading: boolean = true;

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPurchases();
  }

  loadPurchases() {
    this.isLoading = true;
    this.purchaseService.loadPurchases().subscribe({
      next: (purchases) => {
        this.purchases = purchases;
        this.isLoading = false;
      },
      error: (error) => {
        
        this.purchaseService.purchases$.subscribe(purchases => {
          this.purchases = purchases;
          this.isLoading = false;
        });
      }
    });
  }

  cancelPurchase(purchaseId: string) {
    if (confirm('Sei sicuro di voler cancellare questo acquisto?')) {
      this.purchaseService.cancelPurchase(purchaseId).subscribe({
        next: (response) => {
          if (response.success) {
            alert(response.message);
            
            this.purchases = this.purchaseService.getUserPurchases();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          alert('Errore durante la cancellazione. Riprova.');
        }
      });
    }
  }

  goBack() {
    window.history.back();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancelPurchase(purchase: Purchase): boolean {
    const hoursSincePurchase = (Date.now() - purchase.purchaseDate.getTime()) / (1000 * 60 * 60);
    return hoursSincePurchase <= 24;
  }

  
  onLogoClick() {
    if (this.authService.isLoggedIn()) {
      
      this.router.navigate(['/home']);
    } else {
      
      this.router.navigate(['/login']);
    }
  }

  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  
  getPurchaseType(purchase: Purchase): string {
    return purchase.type || 'movie';
  }

  
  isSeasonPurchase(purchase: Purchase): boolean {
    return purchase.type === 'season';
  }
}
