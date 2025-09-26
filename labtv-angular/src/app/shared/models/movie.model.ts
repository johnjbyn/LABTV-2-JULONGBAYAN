export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  
  name?: string;
  first_air_date?: string;
  
  year?: string;
  type?: string;
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  runtime: number;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
  belongs_to_collection: any;
  credits: Credits;
  similar: {
    results: Movie[];
  };
  
  created_by?: Creator[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  last_air_date?: string;
  in_production?: boolean;
  networks?: Network[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface Crew {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  credit_id: string;
  department: string;
  job: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}


export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  air_date: string;
  episode_count: number;
  vote_average: number;
}

export interface TVDetail extends MovieDetail {
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  last_air_date: string;
  in_production: boolean;
  networks: Network[];
  created_by: Creator[];
}

export interface Network {
  id: number;
  name: string;
  logo_path: string;
  origin_country: string;
}

export interface Creator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string;
}


export interface SeasonPurchase {
  id: string;
  movieId: number;
  movieTitle: string;
  seasonNumber: number;
  seasonName: string;
  price: number;
  purchaseDate: Date;
  type: 'season';
}
