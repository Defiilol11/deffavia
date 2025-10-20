import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-about',
  template: `
    <section class="panel">
      <h1>Acerca de mí</h1>
      <p>Agrega aquí tu información y el enlace a tu GitHub Pages cuando corresponda.</p>
      <ul class="help">
        <li>Paleta: grises con rojo crimson/candy</li>
        <li>Responsive: ≥3 breakpoints (layout simple con escalado en grids)</li>
      </ul>
    </section>
  `,
})
export class AboutComponent {}
