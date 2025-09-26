import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.http.get<any[]>(`${this.API_URL}/users?email=${loginData.email}`).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            const user = users[0];
            if (user.password === loginData.password) {
              const authUser: User = {
                id: user.id,
                firstName: user.nome,
                lastName: user.cognome,
                email: user.email,
                password: user.password,
                isSubscribed: true,
                subscriptionType: user.ruolo === 'amministratore' ? 'Premium' : 'Standard',
                subscriptionDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              this.currentUserSubject.next(authUser);
              localStorage.setItem('currentUser', JSON.stringify(authUser));
              
              observer.next({
                success: true,
                message: 'Login effettuato con successo'
              });
            } else {
              observer.next({
                success: false,
                message: 'Password non corretta'
              });
            }
          } else {
            observer.next({
              success: false,
              message: 'Utente non trovato'
            });
          }
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore durante il login'
          });
          observer.complete();
        }
      });
    });
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      const userData = {
        nome: registerData.firstName,
        cognome: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        ruolo: 'utente'
      };

      this.http.post<any>(`${this.API_URL}/users`, userData).subscribe({
        next: (response) => {
          if (response.id) {
            const authUser: User = {
              id: response.id,
              firstName: response.nome,
              lastName: response.cognome,
              email: response.email,
              password: response.password,
              isSubscribed: true,
              subscriptionType: 'Free Trial',
              subscriptionDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            this.currentUserSubject.next(authUser);
            localStorage.setItem('currentUser', JSON.stringify(authUser));
            
            observer.next({
              success: true,
              message: 'Registrazione completata con successo'
            });
          } else {
            observer.next({
              success: false,
              message: 'Errore durante la registrazione'
            });
          }
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore durante la registrazione'
          });
          observer.complete();
        }
      });
    });
  }

  logout(): void {
    const currentUser = this.currentUserSubject.value;
    
    this.currentUserSubject.next(null);
    localStorage.clear();
    
    if (currentUser) {
      
      this.http.delete(`${this.API_URL}/users/${currentUser.id}`).subscribe({
        next: () => {},
        error: (error) => {}
      });
      
      this.http.delete(`${this.API_URL}/acquisti?userId=${currentUser.id}`).subscribe({
        next: () => {},
        error: (error) => {}
      });
      
      this.clearUserFilmData(currentUser.id);
      
      this.resetFilmData();
    }
    
    
    this.router.navigate(['/home']);
  }

  private clearUserFilmData(userId: number): void {
    this.http.get<any[]>(`${this.API_URL}/film?clickedBy=${userId}`).subscribe({
      next: (films) => {
        if (films && films.length > 0) {
          films.forEach(film => {
            this.http.delete(`${this.API_URL}/film/${film.id}`).subscribe({
              next: () => {},
              error: (error) => {}
            });
          });
        } else {
        }
      },
      error: (error) => {}
    });
  }

  private resetFilmData(): void {
    
    this.http.get<any[]>(`${this.API_URL}/film`).subscribe({
      next: (films) => {
        if (films && films.length > 0) {
          films.forEach(film => {
            if (film.clickedBy || film.interactionType) {
              this.http.delete(`${this.API_URL}/film/${film.id}`).subscribe({
                next: () => {},
                error: (error) => {}
              });
            }
          });
        }
      },
      error: (error) => {}
    });
  }

  clearAllData(): void {
    
    this.http.get<any[]>(`${this.API_URL}/users`).subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          users.forEach(user => {
            this.http.delete(`${this.API_URL}/users/${user.id}`).subscribe({
              next: () => {},
              error: (error) => {}
            });
          });
        }
      }
    });
    
    this.http.get<any[]>(`${this.API_URL}/acquisti`).subscribe({
      next: (purchases) => {
        if (purchases && purchases.length > 0) {
          purchases.forEach(purchase => {
            this.http.delete(`${this.API_URL}/acquisti/${purchase.id}`).subscribe({
              next: () => {},
              error: (error) => {}
            });
          });
        }
      }
    });
    
    this.http.get<any[]>(`${this.API_URL}/film`).subscribe({
      next: (films) => {
        if (films && films.length > 0) {
          films.forEach(film => {
            this.http.delete(`${this.API_URL}/film/${film.id}`).subscribe({
              next: () => {},
              error: (error) => {}
            });
          });
        }
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  testLogout(): void {
    this.logout();
  }

  mockLogin(email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
        if (!email || !password) {
          observer.next({
            success: false,
            message: 'Email e password sono obbligatori'
          });
          observer.complete();
        } else if (!this.isValidEmail(email)) {
          observer.next({
            success: false,
            message: 'Formato email non valido'
          });
          observer.complete();
        } else if (password.length < 8) {
          observer.next({
            success: false,
            message: 'La password deve essere di almeno 8 caratteri'
          });
          observer.complete();
        } else if (!this.hasSpecialCharacter(password)) {
          observer.next({
            success: false,
            message: 'La password deve contenere almeno un carattere speciale (!@#$%^&*)'
          });
          observer.complete();
        } else {
          const emailParts = email.split('@');
          const firstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
          
          const mockUser: User = {
            id: Date.now(),
            firstName: firstName,
            lastName: 'User',
            email: email,
            password: password,
            isSubscribed: true,
            subscriptionType: 'Premium',
            subscriptionDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const userData = {
            id: mockUser.id,
            nome: mockUser.firstName,
            cognome: mockUser.lastName,
            email: mockUser.email,
            password: mockUser.password,
            ruolo: 'utente'
          };
          
          this.http.post<any>(`${this.API_URL}/users`, userData).subscribe({
            next: (response) => {
              this.currentUserSubject.next(mockUser);
              localStorage.setItem('currentUser', JSON.stringify(mockUser));
              
              observer.next({
                success: true,
                message: 'Login successful! Benvenuto su LabTV!',
                user: mockUser,
                token: 'mock-token'
              });
            },
            error: (error) => {
              this.currentUserSubject.next(mockUser);
              localStorage.setItem('currentUser', JSON.stringify(mockUser));
              
              observer.next({
                success: true,
                message: 'Login successful! Benvenuto su LabTV!',
                user: mockUser,
                token: 'mock-token'
              });
            }
          });
        }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private hasSpecialCharacter(password: string): boolean {
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialChars.test(password);
  }

  mockRegister(registerData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
        if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
          observer.next({
            success: false,
            message: 'Tutti i campi sono obbligatori'
          });
          observer.complete();
        } else if (!this.isValidEmail(registerData.email)) {
          observer.next({
            success: false,
            message: 'Formato email non valido'
          });
          observer.complete();
        } else if (registerData.password.length < 8) {
          observer.next({
            success: false,
            message: 'La password deve essere di almeno 8 caratteri'
          });
          observer.complete();
        } else if (!this.hasSpecialCharacter(registerData.password)) {
          observer.next({
            success: false,
            message: 'La password deve contenere almeno un carattere speciale (!@#$%^&*)'
          });
          observer.complete();
        } else if (registerData.password !== registerData.confirmPassword) {
          observer.next({
            success: false,
            message: 'Le password non coincidono'
          });
          observer.complete();
        } else if (!registerData.acceptTerms) {
          observer.next({
            success: false,
            message: 'Devi accettare i termini e le condizioni'
          });
          observer.complete();
        } else {
          const mockUser: User = {
            id: Date.now(),
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            email: registerData.email,
            password: registerData.password,
            isSubscribed: true,
            subscriptionType: 'Free Trial',
            subscriptionDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const userData = {
            id: mockUser.id,
            nome: mockUser.firstName,
            cognome: mockUser.lastName,
            email: mockUser.email,
            password: mockUser.password,
            ruolo: 'utente'
          };
          
          this.http.post<any>(`${this.API_URL}/users`, userData).subscribe({
            next: (response) => {
              this.currentUserSubject.next(mockUser);
              localStorage.setItem('currentUser', JSON.stringify(mockUser));
              
              observer.next({
                success: true,
                message: 'Registrazione completata! Benvenuto su LabTV!',
                user: mockUser,
                token: 'mock-token'
              });
              observer.complete();
            },
            error: (error) => {
              this.currentUserSubject.next(mockUser);
              localStorage.setItem('currentUser', JSON.stringify(mockUser));
              
              observer.next({
                success: true,
                message: 'Registrazione completata! Benvenuto su LabTV!',
                user: mockUser,
                token: 'mock-token'
              });
              observer.complete();
            }
          });
        }
    });
  }
}