import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery: string = '';
  showLoginModal: boolean = false;
  showRegisterModal: boolean = false;
  showChoiceModal: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      
    }
  }

  showLogin() {
    this.showLoginModal = true;
    this.showChoiceModal = false;
  }

  showRegister() {
    this.showRegisterModal = true;
    this.showChoiceModal = false;
  }

  showChoice() {
    this.showChoiceModal = true;
  }

  closeModals() {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.showChoiceModal = false;
  }

  logout() {
    this.authService.logout();
  }


}
