import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Movie } from '../shared/models/movie.model';

export interface MovieInteraction {
  id?: number;
  userId: number;
  movieId: number;
  movieTitle: string;
  interactionType: 'click' | 'view' | 'purchase';
  timestamp: string;
  genreIds: number[];
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: Movie[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly API_URL = 'http://localhost:3000';
  private readonly TMDB_API_KEY = 'your-tmdb-api-key';
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  
  private userInteractionsSubject = new BehaviorSubject<MovieInteraction[]>([]);
  public userInteractions$ = this.userInteractionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  trackMovieInteraction(movie: Movie, interactionType: 'click' | 'view' | 'purchase'): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'User not logged in' });
        observer.complete();
      });
    }


    const interaction: MovieInteraction = {
      userId: currentUser.id,
      movieId: movie.id,
      movieTitle: movie.title || movie.name || 'Unknown Title',
      interactionType: interactionType,
      timestamp: new Date().toISOString(),
      genreIds: movie.genre_ids || []
    };

    
    const filmData = {
      movieId: movie.id,
      title: movie.title || movie.name || 'Unknown Title',
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || movie.first_air_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      genre_ids: movie.genre_ids || [],
      adult: movie.adult || false,
      original_language: movie.original_language || '',
      original_title: movie.original_title || '',
      popularity: movie.popularity || 0,
      video: movie.video || false,
      name: movie.name || '',
      first_air_date: movie.first_air_date || '',
      type: movie.first_air_date ? 'tv' : 'movie',
      interactionType: interactionType,
      clickedAt: new Date().toISOString(),
      clickedBy: currentUser.id
    };

    return this.http.post<any>(`${this.API_URL}/film`, filmData).pipe(
      tap(response => {
      }),
      tap(error => {
        if (error) {
        }
      })
    );
  }

  getUserInteractions(): Observable<MovieInteraction[]> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.API_URL}/film?clickedBy=${currentUser.id}`).pipe(
      map(films => films.map(film => ({
        id: film.id,
        userId: film.clickedBy,
        movieId: film.movieId,
        movieTitle: film.title,
        interactionType: film.interactionType,
        timestamp: film.clickedAt,
        genreIds: film.genre_ids
      })))
    );
  }

  getSimilarMovies(movieId: number): Observable<Movie[]> {
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  getRecommendations(): Observable<RecommendationResponse> {
    return new Observable(observer => {
      this.getUserInteractions().subscribe({
        next: (interactions) => {
          if (interactions.length === 0) {
            observer.next({
              success: false,
              message: 'Nessuna interazione trovata per generare raccomandazioni',
              recommendations: []
            });
            observer.complete();
            return;
          }

          const genreFrequency = this.getGenreFrequency(interactions);
          const topGenres = this.getTopGenres(genreFrequency, 3);

          this.getMoviesByGenres(topGenres).subscribe({
            next: (movies) => {
              observer.next({
                success: true,
                recommendations: movies.slice(0, 6),
                message: `Raccomandazioni basate sui tuoi gusti`
              });
              observer.complete();
            },
            error: (error) => {
              observer.next({
                success: false,
                message: 'Errore nel caricamento delle raccomandazioni',
                recommendations: []
              });
              observer.complete();
            }
          });
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Errore nel caricamento delle interazioni',
            recommendations: []
          });
          observer.complete();
        }
      });
    });
  }

  private getMoviesByGenres(genreIds: number[]): Observable<Movie[]> {
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  private getGenreFrequency(interactions: MovieInteraction[]): { [key: number]: number } {
    const frequency: { [key: number]: number } = {};
    
    interactions.forEach(interaction => {
      interaction.genreIds.forEach(genreId => {
        frequency[genreId] = (frequency[genreId] || 0) + 1;
      });
    });
    
    return frequency;
  }

  private getTopGenres(genreFrequency: { [key: number]: number }, count: number): number[] {
    return Object.entries(genreFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([genreId]) => parseInt(genreId));
  }

  clearUserInteractions(): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'User not logged in' });
        observer.complete();
      });
    }

    return this.http.delete(`${this.API_URL}/film?clickedBy=${currentUser.id}`).pipe(
      tap(response => {})
    );
  }
}