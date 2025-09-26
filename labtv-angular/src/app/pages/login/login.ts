import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  emailInput: string = '';
  showChoiceModal: boolean = false;
  showLoginModal: boolean = false;
  showRegisterModal: boolean = false;
  showRecoveryModal: boolean = false;
  isSubmitting: boolean = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false, 
    newsletter: false
  };

  recoveryEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onEmailSubmit() {
    if (this.emailInput.trim()) {
      
      if (!this.isValidEmail(this.emailInput.trim())) {
        alert('Inserisci un indirizzo email valido');
        return;
      }
      
      
      this.loginData.email = this.emailInput.trim();
      this.registerData.email = this.emailInput.trim();
      this.recoveryEmail = this.emailInput.trim();
      this.showChoiceModal = true;
    }
  }

  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  
  isValidPassword(password: string): boolean {
    
    const minLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return minLength && hasSpecialChar;
  }

  showLogin() {
    this.showChoiceModal = false;
    this.showLoginModal = true;
    this.showRegisterModal = false;
    this.showRecoveryModal = false;
    
    if (this.registerData.email) {
      this.loginData.email = this.registerData.email;
      this.recoveryEmail = this.registerData.email;
    }
  }

  showRegister() {
    this.showChoiceModal = false;
    this.showLoginModal = false;
    this.showRegisterModal = true;
    this.showRecoveryModal = false;
    
    if (this.loginData.email) {
      this.registerData.email = this.loginData.email;
      this.recoveryEmail = this.loginData.email;
    }
  }

  showRecovery() {
    this.showLoginModal = false;
    this.showRecoveryModal = true;
    
    if (this.loginData.email) {
      this.recoveryEmail = this.loginData.email;
    }
  }

  
  returnToLoginFromRecovery() {
    this.showChoiceModal = false;
    this.showLoginModal = true;
    this.showRegisterModal = false;
    this.showRecoveryModal = false;
  }

  closeChoiceModal() {
    this.showChoiceModal = false;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  closeRecoveryModal() {
    this.showRecoveryModal = false;
  }

  onLoginSubmit() {
    
    if (!this.isValidEmail(this.loginData.email)) {
      alert('Inserisci un indirizzo email valido');
      return;
    }
    
    
    if (!this.loginData.password) {
      alert('Inserisci la password');
      return;
    }
    
    if (this.loginData.email && this.loginData.password) {
      this.isSubmitting = true;
      
      this.authService.mockLogin(this.loginData.email, this.loginData.password).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            
            this.router.navigate(['/home']);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          alert('Errore durante il login. Riprova.');
        }
      });
    }
  }

  onRegisterSubmit() {
    
    if (!this.isValidEmail(this.registerData.email)) {
      alert('Inserisci un indirizzo email valido');
      return;
    }
    
    
    if (!this.isValidPassword(this.registerData.password)) {
      alert('La password deve contenere almeno 8 caratteri e un carattere speciale');
      return;
    }
    
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Le password non coincidono');
      return;
    }
    
    
    if (!this.registerData.acceptTerms) {
      alert('Devi accettare i termini e le condizioni per procedere');
      return;
    }
    
    if (this.isRegisterFormValid()) {
      this.isSubmitting = true;
      
      this.authService.mockRegister(this.registerData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            
            this.router.navigate(['/home']);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          alert('Errore durante la registrazione. Riprova.');
        }
      });
    }
  }

  onRecoverySubmit() {
    
    if (!this.isValidEmail(this.recoveryEmail.trim())) {
      alert('Inserisci un indirizzo email valido');
      return;
    }
    
    if (this.recoveryEmail.trim()) {
      alert('Email di recupero inviata! Controlla la tua casella di posta.');
      
      this.recoveryEmail = '';
      
      this.returnToLoginFromRecovery();
    }
  }

  isRegisterFormValid(): boolean {
    return !!(
      this.registerData.firstName &&
      this.registerData.lastName &&
      this.registerData.email &&
      this.registerData.password &&
      this.registerData.confirmPassword &&
      this.registerData.acceptTerms &&
      this.registerData.password === this.registerData.confirmPassword
    );
  }

  goToHome() {
    this.router.navigate(['/home']);
  }


  
  onLogoClick() {
    if (this.authService.isLoggedIn()) {
      
      this.router.navigate(['/home']);
    } else {
      
      
      window.location.reload();
    }
  }

  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  
  goToContact() {
    this.router.navigate(['/contact']);
  }
}
