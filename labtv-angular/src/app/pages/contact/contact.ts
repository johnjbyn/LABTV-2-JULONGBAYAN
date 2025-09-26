import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent implements OnInit {
  contactData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting: boolean = false;
  showMessage: boolean = false;
  isSuccess: boolean = false;
  message: string = '';
  
  fieldErrors = {
    firstName: false,
    lastName: false,
    email: false,
    subject: false,
    message: false
  };

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    window.history.back();
  }

  onSubmit() {
    this.validateForm();
    
    if (this.isFormValid()) {
      this.isSubmitting = true;
      
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.message = 'Messaggio inviato con successo! Ti risponderemo presto.';
        this.showMessage = true;
        this.resetForm();
        
        setTimeout(() => {
          this.showMessage = false;
          this.message = '';
        }, 5000);
      }, 2000);
    } else {
      this.isSuccess = false;
      this.message = 'Compila tutti i campi obbligatori.';
      this.showMessage = true;
    }
  }

  validateForm() {
    this.fieldErrors.firstName = !this.contactData.firstName.trim();
    this.fieldErrors.lastName = !this.contactData.lastName.trim();
    this.fieldErrors.email = !this.contactData.email.trim() || !this.isValidEmail(this.contactData.email);
    this.fieldErrors.subject = !this.contactData.subject.trim();
    this.fieldErrors.message = !this.contactData.message.trim();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onFieldChange(fieldName: string) {
    if (this.fieldErrors[fieldName as keyof typeof this.fieldErrors]) {
      this.fieldErrors[fieldName as keyof typeof this.fieldErrors] = false;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.contactData.firstName &&
      this.contactData.lastName &&
      this.contactData.email &&
      this.contactData.subject &&
      this.contactData.message
    );
  }

  resetForm() {
    this.contactData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
    this.fieldErrors = {
      firstName: false,
      lastName: false,
      email: false,
      subject: false,
      message: false
    };
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
}
