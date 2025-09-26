import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie, MovieDetail, MovieResponse, VideoResponse, TVDetail, Season, Genre } from '../shared/models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_KEY = environment.tmdbApiKey;
  private readonly BASE_URL = environment.tmdbBaseUrl;
  private readonly IMAGE_BASE_URL = environment.tmdbImageBaseUrl;

  constructor(private http: HttpClient) { }

  
  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('page', page.toString())
      .set('language', 'it-IT')
      .set('sort_by', 'popularity.desc');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/discover/movie`, { params });
  }

  
  getMovieDetail(movieId: number): Observable<MovieDetail> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT') 
      .set('append_to_response', 'credits,similar');
    
    return this.http.get<MovieDetail>(`${this.BASE_URL}/movie/${movieId}`, { params });
  }

  
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('query', query)
      .set('page', page.toString())
      .set('language', 'it-IT');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/search/movie`, { params });
  }

  
  getTrendingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('time_window', 'week')
      .set('page', page.toString())
      .set('language', 'it-IT');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/trending/movie/week`, { params });
  }

  
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('page', page.toString())
      .set('language', 'it-IT');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/movie/top_rated`, { params });
  }

  
  getTopRatedTVSeries(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('page', page.toString())
      .set('language', 'it-IT')
      .set('sort_by', 'vote_average.desc')
      .set('vote_count.gte', '100'); 
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/discover/tv`, { params });
  }

  
  getPopularTVSeries(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('page', page.toString())
      .set('language', 'it-IT')
      .set('sort_by', 'popularity.desc')
      .set('vote_count.gte', '50'); 
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/discover/tv`, { params });
  }

  
  searchMovieByTitle(title: string): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('query', title)
      .set('language', 'it-IT');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/search/movie`, { params });
  }

  
  searchTVByTitle(title: string): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('query', title)
      .set('language', 'it-IT');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/search/tv`, { params });
  }

  
  getMoviesByGenres(genreIds: number[]): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT') 
      .set('sort_by', 'popularity.desc')
      .set('with_genres', genreIds.join(','))
      .set('page', '1');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/discover/movie`, { params });
  }

  
  getTVShowsByGenres(genreIds: number[]): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT') 
      .set('sort_by', 'popularity.desc')
      .set('with_genres', genreIds.join(','))
      .set('page', '1');
    
    return this.http.get<MovieResponse>(`${this.BASE_URL}/discover/tv`, { params });
  }

  
  getTVDetail(tvId: number): Observable<TVDetail> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT') 
      .set('append_to_response', 'credits,similar,created_by');
    
    return this.http.get<TVDetail>(`${this.BASE_URL}/tv/${tvId}`, { params });
  }

  
  getTVSeasons(tvId: number): Observable<TVDetail> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT')
      .set('append_to_response', 'seasons');
    
    return this.http.get<TVDetail>(`${this.BASE_URL}/tv/${tvId}`, { params });
  }

  
  getSeasonDetail(tvId: number, seasonNumber: number): Observable<Season> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT');
    
    return this.http.get<Season>(`${this.BASE_URL}/tv/${tvId}/season/${seasonNumber}`, { params });
  }

  
  getTVVideos(tvId: number): Observable<VideoResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'en-US'); 
    
    return this.http.get<VideoResponse>(`${this.BASE_URL}/tv/${tvId}/videos`, { params });
  }

  
  getMovieVideos(movieId: number): Observable<VideoResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'en-US'); 
    
    return this.http.get<VideoResponse>(`${this.BASE_URL}/movie/${movieId}/videos`, { params });
  }


  
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return 'assets/LabTV-Loghi/404-foresta.jpg';
    return `${this.IMAGE_BASE_URL}/${size}${path}`;
  }

  
  getBackdropUrl(path: string, size: string = 'original'): string {
    if (!path) return 'assets/LabTV-Loghi/glass.jpg';
    return `${this.IMAGE_BASE_URL}/${size}${path}`;
  }

  private filterDramaRomanceMovies(movies: Movie[]): Movie[] {
    return movies.filter(movie => {
      const genreIds = movie.genre_ids || [];
      const hasDrama = genreIds.includes(18);
      const hasRomance = genreIds.includes(10749);
      return !(hasDrama && hasRomance);
    });
  }

  getPopularMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getPopularMovies(page).pipe(
      map(response => ({
        ...response,
        results: this.filterDramaRomanceMovies(response.results)
      }))
    );
  }

  getTopRatedMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getTopRatedMovies(page).pipe(
      map(response => ({
        ...response,
        results: this.filterDramaRomanceMovies(response.results)
      }))
    );
  }

  getTrendingMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getTrendingMovies(page).pipe(
      map(response => ({
        ...response,
        results: this.filterDramaRomanceMovies(response.results)
      }))
    );
  }

  getMoviesByGenresFiltered(genreIds: number[]): Observable<MovieResponse> {
    return this.getMoviesByGenres(genreIds).pipe(
      map(response => ({
        ...response,
        results: this.filterDramaRomanceMovies(response.results)
      }))
    );
  }

  getMovieGenres(): Observable<{genres: Genre[]}> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'it-IT');
    
    return this.http.get<{genres: Genre[]}>(`${this.BASE_URL}/genre/movie/list`, { params });
  }
}
