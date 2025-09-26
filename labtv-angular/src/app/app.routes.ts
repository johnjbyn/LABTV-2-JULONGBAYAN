import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ContactComponent } from './pages/contact/contact';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { PurchasesComponent } from './pages/purchases/purchases';
import { AllMoviesComponent } from './pages/all-movies/all-movies';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'purchases', component: PurchasesComponent },
  { path: 'all-movies', component: AllMoviesComponent },
  { path: '**', redirectTo: '' }
];
