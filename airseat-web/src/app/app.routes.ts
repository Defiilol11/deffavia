import { Routes } from '@angular/router';
import { HomeComponent } from './app/pages/home/home.component';
import { AboutComponent } from './app/pages/about/about.component';
import { authGuard } from './app/features/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Inicio' },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./app/features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Registro',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./app/features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Inicio de sesión',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/auth/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Mi Perfil',
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/notifications/notification-history.component').then(
        (m) => m.NotificationHistoryComponent
      ),
    title: 'Notificaciones',
  },
  {
    path: 'seats',
    loadComponent: () =>
      import('./app/features/seats/seat-map/seat-map.component').then((m) => m.SeatMapComponent),
    title: 'Asientos',
  },

  {
    path: 'reservations/wizard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/reservations/reservation-wizard/reservation-wizard.component').then(
        (m) => m.ReservationWizardComponent
      ),
    title: 'Reservar',
  },
  {
    path: 'reservations/group',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/reservations/group-reservation/group-reservation.component').then(
        (m) => m.GroupReservationComponent
      ),
    title: 'Reserva Grupal',
  },
  {
    path: 'reservations/my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/reservations/my-reservations/my-reservations.component').then(
        (m) => m.MyReservationsComponent
      ),
    title: 'Mis reservas',
  },
  {
    path: 'files',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/files/files-page.component').then((m) => m.FilesPageComponent),
    title: 'Exportar / Importar reservas',
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app/features/reports/reports.component').then((m) => m.ReportsComponent),
    title: 'Reportes',
  },

  { path: 'about', component: AboutComponent, title: 'Acerca de mí' },
  { path: '**', redirectTo: '' },
];
