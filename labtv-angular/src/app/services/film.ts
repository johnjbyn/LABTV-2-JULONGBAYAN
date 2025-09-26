import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../shared/models/movie.model';

export interface FilmClick {
  id?: number;
  movieId: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  clickedAt: string;
  contentType: 'movie' | 'tv';
}

@Injectable({
  providedIn: 'root'
})
export class FilmService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  trackMovieClick(movie: Movie): Observable<FilmClick> {
    const filmClick: Omit<FilmClick, 'id'> = {
      movieId: movie.id,
      title: movie.title || movie.name || 'Unknown Title',
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      first_air_date: movie.first_air_date,
      vote_average: movie.vote_average,
      overview: movie.overview || '',
      clickedAt: new Date().toISOString(),
      contentType: movie.first_air_date ? 'tv' : 'movie'
    };

    return this.http.post<FilmClick>(`${this.API_URL}/film`, filmClick);
  }

  getClickedFilms(): Observable<FilmClick[]> {
    return this.http.get<FilmClick[]>(`${this.API_URL}/film`);
  }

  getClickedFilmByMovieId(movieId: number): Observable<FilmClick[]> {
    return this.http.get<FilmClick[]>(`${this.API_URL}/film?movieId=${movieId}`);
  }

  deleteFilmClick(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/film/${id}`);
  }
}
