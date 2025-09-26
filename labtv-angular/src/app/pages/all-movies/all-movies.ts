import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { PurchaseService } from '../../services/purchase';
import { AuthService } from '../../services/auth';
import { RecommendationService } from '../../services/recommendation';
import { Movie, MovieDetail, Season, TVDetail, Creator, Genre } from '../../shared/models/movie.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-all-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-movies.html',
  styleUrl: './all-movies.css'
})
export class AllMoviesComponent implements OnInit {
  movies: Movie[] = [];
  currentPage: number = 1;
  isLoading: boolean = false;
  hasMore: boolean = true;
  moviesPerLoad: number = 25;

  searchQuery: string = '';
  searchResults: Movie[] = [];
  isSearchActive: boolean = false;
  displayedSearchQuery: string = '';

  availableGenres: Genre[] = [];
  selectedCategory: string = '';
  filteredMovies: Movie[] = [];

  
  showMovieDetailModal: boolean = false;
  selectedMovie: MovieDetail | null = null;
  selectedMovieTrailer: any = null;
  trailerLoading: boolean = false;
  similarMoviesLoading: boolean = false;
  currentTrailerUrl: SafeResourceUrl | null = null;
  
  
  selectedMovieSeasons: Season[] = [];
  selectedSeason: Season | null = null;

  @ViewChild('similarMoviesTrack') similarMoviesTrack!: ElementRef;
  @ViewChild('seasonsTrack') seasonsTrack!: ElementRef;

  constructor(
    private movieService: MovieService,
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private recommendationService: RecommendationService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadGenres();
    this.loadMovies();
    this.setupInfiniteScroll();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadGenres() {
    this.movieService.getMovieGenres().subscribe({
      next: (response) => {
        this.availableGenres = response.genres.filter(genre => genre.id !== 10749);
        if (this.availableGenres.length > 0) {
          this.selectedCategory = this.availableGenres[0].id.toString();
          this.applyCurrentFilter();
        }
      },
      error: (error) => {

      }
    });
  }

  loadMovies() {
    this.isLoading = true;
    this.currentPage = 1;
    this.movies = [];
    this.hasMore = true;
    
    this.movieService.getPopularMoviesFiltered(this.currentPage).subscribe({
      next: (response) => {
        this.movies = [...response.results];
        this.isLoading = false;
        this.hasMore = this.currentPage < response.total_pages;
      },
      error: (error) => {

        this.isLoading = false;
      }
    });
  }

  loadMoreMovies() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    this.currentPage++;
    
    this.movieService.getPopularMoviesFiltered(this.currentPage).subscribe({
      next: (response) => {
        const newMovies = response.results;
        this.movies = [...this.movies, ...newMovies];
        this.applyCurrentFilter();
        this.isLoading = false;
        this.hasMore = this.currentPage < response.total_pages;
      },
      error: (error) => {

        this.isLoading = false;
        this.currentPage--;
      }
    });
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyCurrentFilter();
  }

  applyCurrentFilter() {
    if (this.selectedCategory === '') {
      this.filteredMovies = [];
    } else {
      const genreId = parseInt(this.selectedCategory);
      this.filteredMovies = this.movies.filter(movie => 
        movie.genre_ids && 
        movie.genre_ids.length > 0 && 
        movie.genre_ids.includes(genreId) &&
        !movie.genre_ids.includes(10749)
      );
    }
  }

  setupInfiniteScroll() {
    let scrollTimeout: any;
    window.addEventListener('scroll', () => {
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;
        
        
        if (scrollPosition >= documentHeight - 500 && !this.isLoading && this.hasMore) {
          this.loadMoreMovies();
        }
      }, 100);
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  getImageUrl(posterPath: string, size: string = 'w500'): string {
    return this.movieService.getImageUrl(posterPath, size);
  }

  showMovieDetail(movie: Movie) {
    this.trailerLoading = true;
    this.selectedMovieTrailer = null;
    this.currentTrailerUrl = null;
    
    this.resetPopupScroll();
    
    this.recommendationService.trackMovieInteraction(movie, 'click').subscribe({
        next: (response) => {},
        error: (error) => {}
    });
    
    
    const isTVShow = (movie as any).content_type === 'tv' || movie.first_air_date;
    
    if (isTVShow) {
      
      this.movieService.getTVDetail(movie.id).subscribe({
        next: (tvDetail) => {
          this.selectedMovie = tvDetail;
          this.showMovieDetailModal = true;
          
          
          this.scrollPopupToTop();
          
          
          this.loadTVTrailer(movie.id);
          
          
          this.loadTVSeasons(movie);
          
          
          this.getSimilarTVShowsByGenre();
          
          
          this.loadSimilarMoviesFromPopular();
        },
        error: (error) => {

          this.trailerLoading = false;
        }
      });
    } else {
      
      this.movieService.getMovieDetail(movie.id).subscribe({
        next: (movieDetail) => {
          this.selectedMovie = movieDetail;
          this.showMovieDetailModal = true;
          
          
          this.scrollPopupToTop();
          
          
          this.loadMovieTrailer(movie.id);
          
          
          this.selectedMovieSeasons = [];
          this.selectedSeason = null;
          
          
          this.getSimilarMoviesByGenre();
          
          
          this.loadSimilarMoviesFromPopular();
        },
        error: (error) => {

          this.trailerLoading = false;
        }
      });
    }
  }

  closeMovieDetail() {
    this.showMovieDetailModal = false;
    this.selectedMovie = null;
    this.selectedMovieTrailer = null;
    this.currentTrailerUrl = null;
    this.trailerLoading = false;
    this.similarMoviesLoading = false;
    this.selectedMovieSeasons = [];
    this.selectedSeason = null;
  }
  loadMovieTrailer(movieId: number) {
    this.movieService.getMovieVideos(movieId).subscribe({
      next: (response) => {
        const trailer = response.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          this.selectedMovieTrailer = trailer;
          this.currentTrailerUrl = this.getTrailerUrl(trailer.key);
        }
        this.trailerLoading = false;
      },
      error: (error) => {

        this.trailerLoading = false;
      }
    });
  }

  loadTVTrailer(tvId: number) {
    this.movieService.getTVVideos(tvId).subscribe({
      next: (response) => {
        const trailer = response.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          this.selectedMovieTrailer = trailer;
          this.currentTrailerUrl = this.getTrailerUrl(trailer.key);
        }
        this.trailerLoading = false;
      },
      error: (error) => {

        this.trailerLoading = false;
      }
    });
  }

  getTrailerUrl(key: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${key}?rel=0&modestbranding=1&playsinline=1&autoplay=0&controls=1&fs=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSimilarMoviesByGenre() {
    if (!this.selectedMovie?.genres || this.selectedMovie.genres.length === 0) {
      return;
    }

    this.similarMoviesLoading = true;
    const genreIds = this.selectedMovie.genres.map(genre => genre.id).slice(0, 3);
    
    this.movieService.getMoviesByGenresFiltered(genreIds).subscribe({
      next: (response) => {
        
        const similarMovies = response.results.filter(movie => 
          movie.id !== this.selectedMovie?.id
        ).slice(0, 8);
        
        if (this.selectedMovie) {
          this.selectedMovie.similar = { results: similarMovies };
        }
        this.similarMoviesLoading = false;
      },
      error: (error) => {

        this.similarMoviesLoading = false;
        this.useOriginalSimilarMovies();
      }
    });
  }

  getSimilarTVShowsByGenre() {
    if (!this.selectedMovie?.genres || this.selectedMovie.genres.length === 0) {
      return;
    }

    this.similarMoviesLoading = true;
    const genreIds = this.selectedMovie.genres.map(genre => genre.id).slice(0, 3);
    
    this.movieService.getTVShowsByGenres(genreIds).subscribe({
      next: (response) => {
        
        const similarTVShows = response.results.filter(tv => 
          tv.id !== this.selectedMovie?.id
        ).slice(0, 8);
        
        if (this.selectedMovie) {
          this.selectedMovie.similar = { results: similarTVShows };
        }
        this.similarMoviesLoading = false;
      },
      error: (error) => {

        this.similarMoviesLoading = false;
        this.useOriginalSimilarMovies();
      }
    });
  }

  useOriginalSimilarMovies() {
    
    if (this.selectedMovie?.similar?.results) {
      this.similarMoviesLoading = false;
    }
  }

  showSimilarMovie(similarMovie: Movie) {
    this.showMovieDetail(similarMovie);
  }

  
  hasGenres(): boolean {
    return !!(this.selectedMovie?.genres && this.selectedMovie.genres.length > 0);
  }

  hasCast(): boolean {
    return !!(this.selectedMovie?.credits?.cast && this.selectedMovie.credits.cast.length > 0);
  }

  hasDirector(): boolean {
    return !!(this.selectedMovie?.credits?.crew && this.getDirectorName(this.selectedMovie.credits.crew) !== 'N/A');
  }

  hasSimilarMovies(): boolean {
    return !!(this.selectedMovie?.similar?.results && this.selectedMovie.similar.results.length > 0);
  }

  getDirectorName(crew: any[]): string {
    if (!crew || crew.length === 0) return 'N/A';
    const director = crew.find(member => member.job === 'Director');
    return director?.name || 'N/A';
  }

  
  purchaseMovie(movie: Movie) {
    
    if (!movie.title && !movie.name) {

      
      if (this.selectedMovie && this.selectedMovie.id === movie.id) {
        const title = this.selectedMovie.title || this.selectedMovie.name;
        if (title) {
          movie.title = title;
        }
      }
    }
    
    this.purchaseService.purchaseMovie(movie).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          
          this.showMovieDetail(movie);
        } else {
          alert(response.message);
        }
      },
      error: (error) => {

        alert('Errore durante l\'acquisto. Riprova più tardi.');
      }
    });
  }

  isMoviePurchased(movieId: number): boolean {
    return this.purchaseService.isMoviePurchased(movieId);
  }

  getMoviePrice(movie: Movie): number {
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

  
  hasCreators(): boolean {
    return !!(this.selectedMovie && (this.selectedMovie as any).created_by && (this.selectedMovie as any).created_by.length > 0);
  }

  

  
  getCreators(createdBy: Creator[] | undefined): Creator[] {
    return createdBy || [];
  }

  
  getTVShowCreators(): Creator[] {
    if (this.selectedMovie && this.isTVShow(this.selectedMovie)) {
      return (this.selectedMovie as any).created_by || [];
    }
    return [];
  }

  selectSeason(season: Season) {
    this.selectedSeason = season;
  }

  getSeasonPrice(season: Season): number {
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

  isSeasonPurchased(movieId: number, seasonNumber: number): boolean {
    return this.purchaseService.isSeasonPurchased(movieId, seasonNumber);
  }

  purchaseSeason(movie: Movie, season: Season) {
    this.purchaseService.purchaseSeason(movie, season).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
        } else {
          alert(response.message);
        }
      },
      error: (error) => {

        alert('Errore durante l\'acquisto della stagione');
      }
    });
  }

  
  loadTVSeasons(movie: Movie) {
    if (this.isTVShow(movie)) {
      this.movieService.getTVSeasons(movie.id).subscribe({
        next: (tvDetail: TVDetail) => {
          this.selectedMovieSeasons = tvDetail.seasons || [];
          
          if (this.selectedMovieSeasons.length > 0) {
            this.selectedSeason = this.selectedMovieSeasons[0];
          }
        },
        error: (error) => {

          this.selectedMovieSeasons = [];
        }
      });
    } else {
      this.selectedMovieSeasons = [];
      this.selectedSeason = null;
    }
  }

  onTrailerClick() {
    if (this.selectedMovieTrailer) {
      this.currentTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.selectedMovieTrailer.key}?autoplay=1`
      );
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.displayedSearchQuery = this.searchQuery.trim();
      this.isSearchActive = true;
      this.searchResults = [];
      this.performSearch();
    }
  }

  onSearchInputChange(): void {
    if (this.searchQuery.trim() === '') {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearchActive = false;
    this.displayedSearchQuery = '';
  }

  private performSearch(): void {
    this.movieService.searchMovies(this.searchQuery).subscribe({
      next: (response) => {
        this.searchResults = response.results || [];
      },
      error: (error) => {

        this.searchResults = [];
      }
    });
  }

  goToPurchases(): void {
    this.router.navigate(['/purchases']);
  }

  logout(): void {
    this.authService.logout();
  }

  scrollCarousel(section: string, direction: 'left' | 'right'): void {
    const track = document.querySelector(`#${section}Track`) as HTMLElement;
    if (track) {
      const scrollAmount = 300;
      const currentScroll = track.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      track.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }

  scrollSimilarMovies(direction: 'left' | 'right'): void {
    if (this.similarMoviesTrack) {
      const scrollAmount = 300;
      const currentScroll = this.similarMoviesTrack.nativeElement.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      this.similarMoviesTrack.nativeElement.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }
  scrollSeasons(direction: 'left' | 'right'): void {
    if (this.seasonsTrack) {
      const scrollAmount = 300;
      const currentScroll = this.seasonsTrack.nativeElement.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      this.seasonsTrack.nativeElement.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }
  loadSimilarMoviesFromPopular(): void {
    this.similarMoviesLoading = true;
    
    this.movieService.getPopularMoviesFiltered(1).subscribe({
      next: (response) => {
        const similarMovies = response.results
          .filter(movie => movie.id !== this.selectedMovie?.id)
          .slice(0, 8);
        
        if (this.selectedMovie) {
          this.selectedMovie.similar = { results: similarMovies };
        }
        this.similarMoviesLoading = false;
      },
      error: (error) => {

        this.similarMoviesLoading = false;
      }
    });
  }

  isTVShow(movie: Movie | MovieDetail | null): boolean {
    if (!movie) return false;
    return !!(movie as any).first_air_date || (movie as any).content_type === 'tv';
  }

  hasTVShowDirector(): boolean {
    return !!(this.selectedMovie && this.isTVShow(this.selectedMovie) && (this.selectedMovie as any).created_by && (this.selectedMovie as any).created_by.length > 0);
  }

  getTVShowDirectorName(): string {
    if (this.selectedMovie && this.isTVShow(this.selectedMovie) && (this.selectedMovie as any).created_by) {
      const creators = (this.selectedMovie as any).created_by;
      if (creators && creators.length > 0) {
        return creators.map((creator: any) => creator.name).join(', ');
      }
    }
    return 'N/A';
  }

  resetPopupScroll() {
    const popup = document.querySelector('.wide-popup');
    if (popup) {
      popup.scrollTop = 0;
    }
  }

  scrollPopupToTop() {
    const popup = document.querySelector('.wide-popup');
    if (popup) {
      popup.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setTimeout(() => {
      const popup = document.querySelector('.wide-popup');
      if (popup) {
        popup.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
    
    setTimeout(() => {
      const popup = document.querySelector('.wide-popup');
      if (popup) {
        popup.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
    
    setTimeout(() => {
      const popup = document.querySelector('.wide-popup');
      if (popup) {
        popup.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  }

}
