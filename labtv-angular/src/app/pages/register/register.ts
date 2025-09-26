import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false
  };

  isSubmitting: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  showSuccess: boolean = false;
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.mockRegister(this.registerForm).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showSuccess = true;
            this.successMessage = response.message;
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 3000);
          } else {
            this.showError = true;
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showError = true;
          this.errorMessage = 'Errore durante la registrazione. Riprova.';
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.registerForm.firstName &&
      this.registerForm.lastName &&
      this.registerForm.email &&
      this.registerForm.password &&
      this.registerForm.confirmPassword &&
      this.registerForm.acceptTerms &&
      this.registerForm.password === this.registerForm.confirmPassword
    );
  }

  passwordsMatch(): boolean {
    return this.registerForm.password === this.registerForm.confirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
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

  
  goToContact() {
    this.router.navigate(['/contact']);
  }
}
