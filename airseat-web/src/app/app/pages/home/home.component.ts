import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="panel" style="display:grid;gap:.5rem">
      <h1 style="margin:.25rem 0">Sistema de reserva de asientos</h1>
      <p style="color:var(--text-weak)">
        UI en memoria (demo). Solo se lee el estado real de ocupación desde la API.
      </p>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <a routerLink="/reservations/wizard" class="btn">Comenzar reserva</a>
        <a routerLink="/seats" class="btn secondary">Ver diagrama</a>
        <a routerLink="/reservations/my" routerLinkActive="active" class="btn secondary"
          >Mis reservas</a
        >
      </div>
    </section>
  `,
})
export class HomeComponent {}
