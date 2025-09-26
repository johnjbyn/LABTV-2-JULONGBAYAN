import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactComponent } from './pages/contact/contact';
import { LoginComponent } from './pages/login/login';
import { HomeComponent } from './pages/home/home';
import { PurchasesComponent } from './pages/purchases/purchases';
import { AllMoviesComponent } from './pages/all-movies/all-movies';
import { MobileFooterComponent } from './components/mobile-footer/mobile-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactComponent, LoginComponent, HomeComponent, PurchasesComponent, AllMoviesComponent, MobileFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
