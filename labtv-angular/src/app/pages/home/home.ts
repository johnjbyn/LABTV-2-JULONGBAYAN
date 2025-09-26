import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie';
import { PurchaseService } from '../../services/purchase';
import { AuthService } from '../../services/auth';
import { RecommendationService } from '../../services/recommendation';
import { FilmService } from '../../services/film';
import { Movie, MovieDetail, Video, Season, TVDetail, Creator } from '../../shared/models/movie.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('consigliatiTrack') consigliatiTrack!: ElementRef;
  @ViewChild('serieTrack') serieTrack!: ElementRef;
  @ViewChild('similarMoviesTrack') similarMoviesTrack!: ElementRef;
  @ViewChild('seasonsTrack') seasonsTrack!: ElementRef;

  popularMovies: Movie[] = [];
  searchResults: Movie[] = [];
  selectedMovie: MovieDetail | null = null;
  showMovieDetailModal: boolean = false;
  searchQuery: string = '';
  displayedSearchQuery: string = '';
  isLoading: boolean = false;
  isSearchActive: boolean = false;
  heroMovie: Movie | null = null;
  heroIndex: number = 0;
  selectedMovieTrailer: Video | null = null;
  trailerLoading: boolean = false;
  similarMoviesLoading: boolean = false;
  currentTrailerUrl: SafeResourceUrl | null = null;
  
  selectedMovieSeasons: Season[] = [];
  selectedSeason: Season | null = null;
  
  recommendedMovies: Movie[] = [];
  recommendedCurrentPage: number = 1;
  recommendedLoading: boolean = false;
  recommendedHasMore: boolean = true;
  
  similarMovies: Movie[] = [];
  
  suggestedMovies: Movie[] = [];
  suggestedMoviesLoading: boolean = false;
  
  topRatedMovies: Movie[] = [];
  topRatedCurrentPage: number = 1;
  topRatedLoading: boolean = false;
  topRatedHasMore: boolean = true;
  
  moviesPerLoad: number = 25;

  
  recommendedTitles = [
    { title: "American Psycho", type: "movie" },
    { title: "Fight Club", type: "movie" },
    { title: "500 Days of Summer", type: "movie" },
    { title: "The Notebook", type: "movie" },
    { title: "Avengers: Endgame", type: "movie" },
    { title: "Spider-Man: No Way Home", type: "movie" },
    { title: "Dunkirk", type: "movie" },
    { title: "The Matrix", type: "movie" },
    { title: "Inception", type: "movie" },
    { title: "The Dark Knight", type: "movie" },
    { title: "Interstellar", type: "movie" },
    { title: "Toy Story", type: "movie" },
    { title: "Frozen", type: "movie" },
    { title: "Moana", type: "movie" },
    { title: "Friends", type: "tv" },
    { title: "Stranger Things", type: "tv" },
    { title: "The Office", type: "tv" },
    { title: "Lost", type: "tv" },
    { title: "The Crown", type: "tv" },
    { title: "The Mandalorian", type: "tv" },
    { title: "The Simpsons", type: "tv" },
    { title: "Avatar: The Last Airbender", type: "tv" },
    { title: "Gravity Falls", type: "tv" },
    { title: "The Big Bang Theory", type: "tv" },
    { title: "Modern Family", type: "tv" },
    { title: "Parks and Recreation", type: "tv" },
    { title: "Brooklyn Nine-Nine", type: "tv" }
  ];

  constructor(
    private movieService: MovieService,
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private recommendationService: RecommendationService,
    private filmService: FilmService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadPopularMovies();
    this.loadRecommendedMovies();
    this.loadTopRatedMovies();
    this.setupInfiniteScroll();
  }

  loadPopularMovies() {
    this.isLoading = true;
    
    this.movieService.getPopularMoviesFiltered().subscribe({
      next: (response) => {
        this.popularMovies = response.results.slice(0, 20);
        this.heroMovie = this.popularMovies[0];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  loadTopRatedMovies() {
    this.topRatedCurrentPage = 1;
    this.topRatedMovies = [];
    this.topRatedHasMore = true;
    
    
    this.loadWesternContent();
  }

  
  loadWesternContent() {
    
    this.movieService.getPopularTVSeries(1).subscribe({
      next: (response) => {
        
        const validWesternTVShows = response.results.filter(tvShow => 
          tvShow.name && 
          tvShow.name.trim() !== '' && 
          tvShow.name !== 'Unknown' &&
          tvShow.poster_path &&
          tvShow.vote_average > 0 &&
          this.isWesternContent(tvShow.name) 
        );
        
        
        this.topRatedMovies = [...validWesternTVShows.slice(0, 15)]; 
        
        
        if (this.topRatedMovies.length < 25) {
          this.loadWesternMoviesAsBackup();
        } else {
          this.topRatedHasMore = false;
        }
      },
      error: (error) => {
        
        this.loadWesternMoviesAsBackup();
      }
    });
  }

  
  loadWesternMoviesAsBackup() {
    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        
        const validWesternMovies = response.results.filter(movie => 
          movie.title && 
          movie.title.trim() !== '' && 
          movie.title !== 'Unknown' &&
          movie.poster_path &&
          movie.vote_average > 0 &&
          this.isWesternContent(movie.title) 
        );
        
        
        const remainingSlots = 25 - this.topRatedMovies.length;
        const additionalWesternMovies = validWesternMovies.slice(0, remainingSlots);
        this.topRatedMovies = [...this.topRatedMovies, ...additionalWesternMovies];
        
        
        if (this.topRatedMovies.length < 25) {
          this.loadPopularTVShowsAsBackup();
        } else {
          this.topRatedHasMore = false;
        }
      },
      error: (error) => {
        
        this.loadPopularTVShowsAsBackup();
      }
    });
  }

  
  isWesternContent(title: string): boolean {
    const westernKeywords = [
      'western', 'cowboy', 'frontier', 'outlaw', 'sheriff', 'ranch', 'desert',
      'america', 'american', 'usa', 'united states', 'texas', 'california',
      'europe', 'european', 'france', 'germany', 'italy', 'spain', 'england',
      'british', 'french', 'german', 'italian', 'spanish', 'dutch', 'swedish',
      'norwegian', 'danish', 'finnish', 'polish', 'czech', 'hungarian',
      'romanian', 'bulgarian', 'croatian', 'serbian', 'slovak', 'slovenian',
      'estonian', 'latvian', 'lithuanian', 'portuguese', 'greek', 'turkish',
      'russian', 'ukrainian', 'belarusian', 'moldovan', 'georgian', 'armenian',
      'australia', 'australian', 'canada', 'canadian', 'new zealand',
      'action', 'adventure', 'drama', 'thriller', 'crime', 'mystery',
      'sci-fi', 'science fiction', 'fantasy', 'horror', 'comedy', 'romance'
    ];
    
    const titleLower = title.toLowerCase();
    return westernKeywords.some(keyword => titleLower.includes(keyword));
  }

  
  loadMoreTopRatedTVShows() {
    
    this.movieService.getPopularTVSeries(this.topRatedCurrentPage + 1).subscribe({
      next: (response) => {
        const validWesternTVShows = response.results.filter(tvShow => 
          tvShow.name && 
          tvShow.name.trim() !== '' && 
          tvShow.name !== 'Unknown' &&
          tvShow.poster_path &&
          tvShow.vote_average > 0 &&
          this.isWesternContent(tvShow.name) 
        );
        
        
        const remainingSlots = 25 - this.topRatedMovies.length;
        const additionalWesternTVShows = validWesternTVShows.slice(0, remainingSlots);
        this.topRatedMovies = [...this.topRatedMovies, ...additionalWesternTVShows];
        
        
        if (this.topRatedMovies.length < 25) {
          this.loadWesternMoviesAsBackup();
        }
      },
      error: (error) => {

        
        this.loadWesternMoviesAsBackup();
      }
    });
  }

  
  loadPopularTVShowsAsBackup() {
    this.movieService.getPopularTVSeries(1).subscribe({
      next: (response) => {
        const validTVShows = response.results.filter(tvShow => 
          tvShow.name && 
          tvShow.name.trim() !== '' && 
          tvShow.name !== 'Unknown' &&
          tvShow.poster_path &&
          tvShow.vote_average > 0
        );
        
        
        const remainingSlots = 25 - this.topRatedMovies.length;
        const additionalTVShows = validTVShows.slice(0, remainingSlots);
        this.topRatedMovies = [...this.topRatedMovies, ...additionalTVShows];
      },
      error: (error) => {

      }
    });
  }

  
  loadTopRatedMoviesFallback() {
    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        
        const validMovies = response.results.filter(movie => 
          movie.title && 
          movie.title.trim() !== '' && 
          movie.title !== 'Unknown' &&
          movie.poster_path &&
          movie.vote_average > 0
        );
        
        this.topRatedMovies = [...validMovies.slice(0, 25)];
        this.topRatedHasMore = false;
      },
      error: (error) => {

      }
    });
  }

  loadRecommendedMovies() {
    this.recommendedCurrentPage = 1;
    this.recommendedMovies = [];
    this.recommendedHasMore = true;
    
    
    this.loadRecommendedFromAPI();
  }

  loadRecommendedFromAPI() {
    this.recommendedLoading = true;
    const searchPromises = this.recommendedTitles.map(item => {
      if (item.type === 'movie') {
        return this.movieService.searchMovieByTitle(item.title).toPromise();
      } else {
        return this.movieService.searchTVByTitle(item.title).toPromise();
      }
    });

    Promise.all(searchPromises).then(responses => {
      const allMovies: Movie[] = [];
      
      responses.forEach((response, index) => {
        if (response && response.results && response.results.length > 0) {
          
          const movie = response.results[0];
          
          (movie as any).content_type = this.recommendedTitles[index].type;
          allMovies.push(movie);
        }
      });

      this.recommendedMovies = allMovies;
      this.recommendedLoading = false;
      this.recommendedHasMore = true;
    }).catch(error => {

      this.recommendedLoading = false;
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.displayedSearchQuery = this.searchQuery; 
      this.isSearchActive = true;
      this.isLoading = true;
      this.movieService.searchMovies(this.searchQuery).subscribe({
        next: (response) => {
          this.searchResults = response.results;
          this.isLoading = false;
        },
        error: (error) => {

          this.isLoading = false;
        }
      });
    } else {
      this.searchResults = [];
      this.isSearchActive = false;
      this.displayedSearchQuery = '';
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.displayedSearchQuery = '';
    this.searchResults = [];
    this.isSearchActive = false;
  }

  onSearchInputChange() {
    
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.isSearchActive = false;
    }
  }

  testClick(movie: Movie) {
    this.showMovieDetail(movie);
  }

  showMovieDetail(movie: Movie) {
    this.trailerLoading = true;
    this.selectedMovieTrailer = null;
    this.currentTrailerUrl = null;
    
    this.resetPopupScroll();
    
    this.filmService.trackMovieClick(movie).subscribe({
      next: (response) => {

      },
      error: (error) => {

      }
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
          
          
          this.loadPersonalizedRecommendations();
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
          
          
          this.loadPersonalizedRecommendations();
        },
        error: (error) => {

          this.trailerLoading = false;
        }
      });
    }
  }

  showSimilarMovie(similarMovie: Movie) {
    
    this.closeMovieDetail();
    
    
    setTimeout(() => {
      this.showMovieDetail(similarMovie);
    }, 100);
  }

  
  getSimilarMoviesByGenre() {
    if (!this.selectedMovie?.genres || this.selectedMovie.genres.length === 0) {
      this.useOriginalSimilarMovies();
      return;
    }

    this.similarMoviesLoading = true;

    
    const mainGenres = this.selectedMovie.genres.slice(0, 2).map(genre => genre.id);
    
    
    this.movieService.getMoviesByGenresFiltered(mainGenres).subscribe({
      next: (movies) => {
        
        const similarMovies = movies.results.filter(movie => 
          movie.id !== this.selectedMovie?.id
        ).slice(0, 8);
        
        
        if (this.selectedMovie) {
          this.selectedMovie.similar = { results: similarMovies };
        }
        this.similarMoviesLoading = false;
        
        if (similarMovies.length === 0) {
          this.loadSuggestedMovies();
        }
      },
      error: (error) => {

        this.similarMoviesLoading = false;
        
        this.useOriginalSimilarMovies();
      }
    });
  }

  
  getSimilarTVShowsByGenre() {
    if (!this.selectedMovie?.genres || this.selectedMovie.genres.length === 0) {
      this.useOriginalSimilarMovies();
      return;
    }

    this.similarMoviesLoading = true;

    
    const mainGenres = this.selectedMovie.genres.slice(0, 2).map(genre => genre.id);
    
    
    this.movieService.getTVShowsByGenres(mainGenres).subscribe({
      next: (tvShows) => {
        
        const similarTVShows = tvShows.results.filter(tvShow => 
          tvShow.id !== this.selectedMovie?.id
        ).slice(0, 8);
        
        
        if (this.selectedMovie) {
          this.selectedMovie.similar = { results: similarTVShows };
        }
        this.similarMoviesLoading = false;
        
        if (similarTVShows.length === 0) {
          this.loadSuggestedMovies();
        }
      },
      error: (error) => {

        this.similarMoviesLoading = false;
        
        this.useOriginalSimilarMovies();
      }
    });
  }

  
  useOriginalSimilarMovies() {
    if (this.selectedMovie?.similar?.results && this.selectedMovie.similar.results.length > 0) {
      return;
    }
    
    if (this.selectedMovie) {
      this.selectedMovie.similar = { results: [] };
    }
    
    this.loadSuggestedMovies();
  }

  loadMovieTrailer(movieId: number) {
    this.movieService.getMovieVideos(movieId).subscribe({
      next: (videoResponse) => {
        const trailer = videoResponse.results.find((video: Video) => 
          video.type === 'Trailer' && 
          video.official === true && 
          video.site === 'YouTube'
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
      next: (videoResponse) => {
        const trailer = videoResponse.results.find((video: Video) => 
          video.type === 'Trailer' && 
          video.official === true && 
          video.site === 'YouTube'
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

  closeMovieDetail() {
    this.showMovieDetailModal = false;
    this.selectedMovie = null;
    this.selectedMovieTrailer = null;
    this.currentTrailerUrl = null;
    this.trailerLoading = false;
    this.selectedMovieSeasons = [];
    this.selectedSeason = null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToContact() {
    
    this.router.navigate(['/contact']);
  }

  goToPurchases() {
    
    if (this.isLoggedIn()) {
      this.router.navigate(['/purchases']);
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

  
  hasTVShowCreators(): boolean {
    return !!(this.selectedMovie && this.isTVShow(this.selectedMovie) && (this.selectedMovie as any).created_by && (this.selectedMovie as any).created_by.length > 0);
  }

  
  hasTVShowDirector(): boolean {
    return !!(this.selectedMovie && this.isTVShow(this.selectedMovie) && (this.selectedMovie as any).created_by && (this.selectedMovie as any).created_by.length > 0);
  }

  
  getTVShowDirectorName(): string {
    if (this.selectedMovie && this.isTVShow(this.selectedMovie) && (this.selectedMovie as any).created_by) {
      const creators = (this.selectedMovie as any).created_by;
      if (creators.length > 0) {
        return creators[0].name;
      }
    }
    return 'Regista non disponibile';
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
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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
          
          if (this.selectedMovie && this.selectedMovie.id === movie.id) {
            this.selectedMovie = { ...this.selectedMovie };
          }
        } else {
          alert(response.message);
        }
      },
      error: (error) => {

        alert('Errore durante l\'acquisto. Riprova.');
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

  getImageUrl(path: string, size: string = 'w500'): string {
    return this.movieService.getImageUrl(path, size);
  }

  getTrailerUrl(key: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${key}?rel=0&modestbranding=1&playsinline=1&autoplay=0&controls=1&fs=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getBackdropUrl(path: string): string {
    return this.movieService.getBackdropUrl(path);
  }

  getDirectorName(crew: any[]): string {
    if (!crew || !Array.isArray(crew)) return 'N/A';
    const director = crew.find(c => c.job === 'Director');
    return director?.name || 'N/A';
  }

  
  hasGenres(): boolean {
    return !!(this.selectedMovie?.genres && this.selectedMovie.genres.length > 0);
  }

  hasCast(): boolean {
    return !!(this.selectedMovie?.credits?.cast && this.selectedMovie.credits.cast.length > 0);
  }

  hasSimilarMovies(): boolean {
    return !!(this.selectedMovie?.similar?.results && this.selectedMovie.similar.results.length > 0);
  }

  hasSuggestedMovies(): boolean {
    return this.suggestedMovies.length > 0;
  }

  loadSuggestedMovies() {
    this.suggestedMoviesLoading = true;
    this.suggestedMovies = [];

    this.recommendationService.getRecommendations().subscribe({
      next: (response) => {
        if (response.success && response.recommendations.length > 0) {
          this.suggestedMovies = response.recommendations.slice(0, 8);
        } else {
          this.loadFallbackSuggestedMovies();
        }
        this.suggestedMoviesLoading = false;
      },
      error: (error) => {

        this.loadFallbackSuggestedMovies();
      }
    });
  }

  loadFallbackSuggestedMovies() {
    this.movieService.getPopularMoviesFiltered(1).subscribe({
      next: (response) => {
        this.suggestedMovies = response.results
          .filter(movie => movie.id !== this.selectedMovie?.id)
          .slice(0, 8);
        
        this.suggestedMoviesLoading = false;
      },
      error: (error) => {

        this.suggestedMoviesLoading = false;
      }
    });
  }

  showSuggestedMovie(suggestedMovie: Movie) {
    this.closeMovieDetail();
    
    setTimeout(() => {
      this.showMovieDetail(suggestedMovie);
    }, 100);
  }

  hasDirector(): boolean {
    return !!(this.selectedMovie?.credits?.crew && this.getDirectorName(this.selectedMovie.credits.crew) !== 'N/A');
  }

  
  scrollCarousel(carouselName: string, direction: 'left' | 'right') {
    const track = carouselName === 'consigliati' ? this.consigliatiTrack : this.serieTrack;
    if (track) {
      const scrollAmount = 300;
      const currentScroll = track.nativeElement.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      track.nativeElement.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }

  scrollSimilarMovies(direction: 'left' | 'right') {
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

  scrollSeasons(direction: 'left' | 'right') {
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

  
  previousHero() {
    if (this.popularMovies.length > 0) {
      this.heroIndex = this.heroIndex > 0 ? this.heroIndex - 1 : this.popularMovies.length - 1;
      this.heroMovie = this.popularMovies[this.heroIndex];
    }
  }

  nextHero() {
    if (this.popularMovies.length > 0) {
      this.heroIndex = this.heroIndex < this.popularMovies.length - 1 ? this.heroIndex + 1 : 0;
      this.heroMovie = this.popularMovies[this.heroIndex];
    }
  }

  
  setupInfiniteScroll() {
    
    
  }

  loadMoreRecommendedMovies() {
    if (this.recommendedLoading) return;
    
    this.recommendedLoading = true;
    
    
    if (this.recommendedMovies.length >= 25) {
      this.recommendedMovies = [];
      this.recommendedCurrentPage = 1;
    } else {
      this.recommendedCurrentPage++;
    }
    
    
    this.loadRecommendedFromAPI();
  }

  loadMoreTopRatedMovies() {
    if (this.topRatedLoading || !this.topRatedHasMore) return;
    
    this.topRatedLoading = true;
    this.topRatedCurrentPage++;
    
    
    this.movieService.getTopRatedTVSeries(this.topRatedCurrentPage).subscribe({
      next: (response) => {
        const newSeries = response.results;
        this.topRatedMovies = [...this.topRatedMovies, ...newSeries];
        this.topRatedLoading = false;
        this.topRatedHasMore = this.topRatedCurrentPage < response.total_pages;
      },
      error: (error) => {

        this.topRatedLoading = false;
        this.topRatedCurrentPage--;
      }
    });
  }

  
  goToAllMovies() {
    this.router.navigate(['/all-movies']);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  
  onLogoClick() {
    if (this.authService.isLoggedIn()) {
      
      this.router.navigate(['/home']);
    } else {
      
      this.router.navigate(['/login']);
    }
  }

  
  isTVShow(movie: Movie | MovieDetail | null): boolean {
    return !!(movie && (movie as any).first_air_date);
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

  
  loadPersonalizedRecommendations() {
    this.similarMoviesLoading = true;
    this.recommendationService.getRecommendations().subscribe({
      next: (response) => {
        if (response.success && response.recommendations) {
          this.similarMovies = response.recommendations;
        } else {
          this.similarMovies = [];
        }
        this.similarMoviesLoading = false;
      },
      error: (error) => {

        this.similarMovies = [];
        this.similarMoviesLoading = false;
      }
    });
  }

  onTrailerClick() {
    if (this.selectedMovieTrailer) {
      this.currentTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.selectedMovieTrailer.key}?autoplay=1`
      );
    }
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
