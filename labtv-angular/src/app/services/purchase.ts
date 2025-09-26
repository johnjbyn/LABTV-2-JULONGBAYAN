import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Movie, Season, SeasonPurchase } from '../shared/models/movie.model';

export interface Purchase {
  id: string;
  userId?: number;
  movieId: number;
  movieTitle: string;
  purchaseDate: Date;
  price: number;
  status: 'completed' | 'pending' | 'cancelled';
  type?: 'movie' | 'season';
  seasonNumber?: number;
  seasonName?: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  purchase?: Purchase;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly API_URL = 'http://localhost:3000';
  private purchasesSubject = new BehaviorSubject<Purchase[]>([]);
  public purchases$ = this.purchasesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPurchasesFromServer();
  }

  private loadPurchasesFromServer(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.http.get<any[]>(`${this.API_URL}/acquisti?userId=${user.id}`).subscribe({
        next: (purchases) => {
          const formattedPurchases = purchases.map(p => ({
            id: p.id.toString(),
            movieId: p.movieId,
            movieTitle: p.movieTitle,
            purchaseDate: new Date(p.purchaseDate),
            price: p.price,
            status: p.status,
            type: p.type || 'movie',
            seasonNumber: p.seasonNumber,
            seasonName: p.seasonName
          }));
          this.purchasesSubject.next(formattedPurchases);
        },
        error: (error) => {
          this.purchasesSubject.next([]);
        }
      });
    } else {
      this.purchasesSubject.next([]);
    }
  }

  purchaseSeason(movie: Movie, season: Season): Observable<PurchaseResponse> {
    return new Observable(observer => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        observer.next({
          success: false,
          message: 'Devi effettuare il login per acquistare una stagione'
        });
        observer.complete();
        return;
      }

      const user = JSON.parse(currentUser);
      const movieTitle = movie.title || movie.name || 'Titolo non disponibile';
      
      const purchaseData = {
        userId: user.id,
        movieId: movie.id,
        movieTitle: movieTitle,
        purchaseDate: new Date().toISOString(),
        price: this.calculateSeasonPrice(season),
        status: 'completed',
        type: 'season',
        seasonNumber: season.season_number,
        seasonName: season.name
      };

      this.http.post<any>(`${this.API_URL}/acquisti`, purchaseData).subscribe({
        next: (response) => {
          if (response.id) {
            const newPurchase: Purchase = {
              id: response.id.toString(),
              userId: response.userId,
              movieId: response.movieId,
              movieTitle: response.movieTitle,
              purchaseDate: new Date(response.purchaseDate),
              price: response.price,
              status: response.status,
              type: response.type,
              seasonNumber: response.seasonNumber,
              seasonName: response.seasonName
            };

            const currentPurchases = this.purchasesSubject.value;
            const updatedPurchases = [...currentPurchases, newPurchase];
            this.purchasesSubject.next(updatedPurchases);

            observer.next({
              success: true,
              message: `Acquisto completato! Hai acquistato "${season.name}" di "${movieTitle}" per €${response.price}`,
              purchase: newPurchase
            });
          } else {
            observer.next({
              success: false,
              message: 'Errore durante l\'acquisto'
            });
          }
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore durante l\'acquisto'
          });
          observer.complete();
        }
      });
    });
  }

  purchaseMovie(movie: Movie): Observable<PurchaseResponse> {
    return new Observable(observer => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        observer.next({
          success: false,
          message: 'Devi effettuare il login per acquistare un film'
        });
        observer.complete();
        return;
      }

      const user = JSON.parse(currentUser);
      const movieTitle = movie.title || movie.name || 'Titolo non disponibile';
      
      const purchaseData = {
        userId: user.id,
        movieId: movie.id,
        movieTitle: movieTitle,
        purchaseDate: new Date().toISOString(),
        price: this.calculatePrice(movie),
        status: 'completed',
        type: 'movie'
      };

      this.http.post<any>(`${this.API_URL}/acquisti`, purchaseData).subscribe({
        next: (response) => {
          if (response.id) {
            const newPurchase: Purchase = {
              id: response.id.toString(),
              userId: response.userId,
              movieId: response.movieId,
              movieTitle: response.movieTitle,
              purchaseDate: new Date(response.purchaseDate),
              price: response.price,
              status: response.status,
              type: response.type
            };

            const currentPurchases = this.purchasesSubject.value;
            const updatedPurchases = [...currentPurchases, newPurchase];
            this.purchasesSubject.next(updatedPurchases);

            observer.next({
              success: true,
              message: `Acquisto completato! Hai acquistato "${movieTitle}" per €${response.price}`,
              purchase: newPurchase
            });
          } else {
            observer.next({
              success: false,
              message: 'Errore durante l\'acquisto'
            });
          }
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore durante l\'acquisto'
          });
          observer.complete();
        }
      });
    });
  }

  loadPurchases(): Observable<Purchase[]> {
    return new Observable(observer => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        observer.next([]);
        observer.complete();
        return;
      }

      const user = JSON.parse(currentUser);
      this.http.get<any[]>(`${this.API_URL}/acquisti?userId=${user.id}`).subscribe({
        next: (purchases) => {
          const formattedPurchases = purchases.map(p => ({
            id: p.id.toString(),
            movieId: p.movieId,
            movieTitle: p.movieTitle,
            purchaseDate: new Date(p.purchaseDate),
            price: p.price,
            status: p.status,
            type: p.type || 'movie',
            seasonNumber: p.seasonNumber,
            seasonName: p.seasonName
          }));
          
          this.purchasesSubject.next(formattedPurchases);
          observer.next(formattedPurchases);
          observer.complete();
        },
        error: (error) => {
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  getUserPurchases(): Purchase[] {
    return this.purchasesSubject.value;
  }

  isMoviePurchased(movieId: number): boolean {
    return this.purchasesSubject.value.some(p => p.movieId === movieId && p.type !== 'season');
  }

  isSeasonPurchased(movieId: number, seasonNumber: number): boolean {
    return this.purchasesSubject.value.some(p => 
      p.movieId === movieId && 
      p.type === 'season' && 
      p.seasonNumber === seasonNumber
    );
  }

  private calculateSeasonPrice(season: Season): number {
    let basePrice = 2.99;
    
    if (season.episode_count > 10) {
      basePrice += 1.00;
    } else if (season.episode_count > 6) {
      basePrice += 0.50;
    }
    
    if (season.vote_average >= 8.0) {
      basePrice += 1.00;
    } else if (season.vote_average >= 7.0) {
      basePrice += 0.50;
    }
    
    return Math.round(basePrice * 100) / 100;
  }

  private calculatePrice(movie: Movie): number {
    let basePrice = 3.99;
    
    if (movie.vote_average >= 8.0) {
      basePrice += 2.00;
    } else if (movie.vote_average >= 7.0) {
      basePrice += 1.00;
    }
    
    if (movie.popularity > 100) {
      basePrice += 1.00;
    }
    
    return Math.round(basePrice * 100) / 100;
  }

  getPurchaseByMovieId(movieId: number): Purchase | undefined {
    return this.purchasesSubject.value.find(p => p.movieId === movieId);
  }

  cancelPurchase(purchaseId: string): Observable<PurchaseResponse> {
    return new Observable(observer => {
      const purchases = this.purchasesSubject.value;
      const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
      
      if (purchaseIndex === -1) {
        observer.next({
          success: false,
          message: 'Acquisto non trovato'
        });
        observer.complete();
        return;
      }

      const purchase = purchases[purchaseIndex];
      const hoursSincePurchase = (Date.now() - purchase.purchaseDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSincePurchase > 24) {
        observer.next({
          success: false,
          message: 'Non puoi cancellare un acquisto dopo 24 ore'
        });
        observer.complete();
        return;
      }

      // Convert string ID to number for JSON server
      const numericId = parseInt(purchaseId, 10);
      if (isNaN(numericId)) {
        observer.next({
          success: false,
          message: 'ID acquisto non valido'
        });
        observer.complete();
        return;
      }

      this.http.delete(`${this.API_URL}/acquisti/${numericId}`).subscribe({
        next: (response) => {
          const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
          this.purchasesSubject.next(updatedPurchases);

          observer.next({
            success: true,
            message: `Acquisto di "${purchase.movieTitle}" cancellato con successo`
          });
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore durante la cancellazione dell\'acquisto'
          });
          observer.complete();
        }
      });
    });
  }
}