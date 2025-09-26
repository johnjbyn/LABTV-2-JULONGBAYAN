import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../shared/models/movie.model';
import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Output() movieClick = new EventEmitter<Movie>();

  constructor(private movieService: MovieService) {}

  onMovieClick() {
    this.movieClick.emit(this.movie);
  }

  getImageUrl(path: string): string {
    return this.movieService.getImageUrl(path);
  }

  getYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  getRatingColor(rating: number): string {
    if (rating >= 7) return '#4CAF50';
    if (rating >= 5) return '#FF9800';
    return '#F44336';
  }
}
