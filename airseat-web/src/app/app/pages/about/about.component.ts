import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <!-- Header Section -->
        <div class="text-center mb-16">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 text-sm font-semibold shadow-sm mb-6"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Acerca de Mí</span>
          </div>

          <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Carlos Taracena
          </h1>
          <p class="text-xl text-white-600 dark:text-gray-300 max-w-3xl mx-auto">
            Desarrollador Fullstack | Programador Junior | Entusiasta de los videojuegos 🎮
          </p>
        </div>

        <!-- Profile Card -->
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-12 border border-gray-100 dark:border-slate-700"
        >
          <div
            class="relative h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
          ></div>

          <div class="relative px-6 pb-8 sm:px-10 sm:pb-10">
            <div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12">
              <!-- Avatar -->
              <div class="relative">
                <div
                  class="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white dark:border-slate-800"
                >
                  CT
                </div>
                <div
                  class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center"
                >
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 text-center sm:text-left">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Carlos Taracena
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                  Desarrollador de software y web con experiencia en tecnologías de desarrollo web y
                  servicios web (SOAP/REST)
                </p>
                <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span
                    class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold"
                  >
                    Fullstack Developer
                  </span>
                  <span
                    class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
                  >
                    JavaScript/TypeScript
                  </span>
                  <span
                    class="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-semibold"
                  >
                    Python
                  </span>
                </div>
              </div>

              <!-- Social Links -->
              <div class="flex gap-3">
                <a
                  href="https://github.com/Defiilol11"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-12 h-12 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="GitHub"
                >
                  <svg
                    class="w-6 h-6 text-gray-700 dark:text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/carlos-taracena-836512217/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg
                    class="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    />
                  </svg>
                </a>
                <a
                  href="mailto:taracenadev@gmail.com"
                  class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Email"
                >
                  <svg
                    class="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <!-- Technical Skills -->
          <div
            class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700"
          >
            <h3
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              Habilidades Técnicas
            </h3>

            <div class="space-y-4">
              <div *ngFor="let skill of technicalSkills">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{
                    skill.name
                  }}</span>
                  <span class="text-sm font-bold text-purple-600 dark:text-purple-400"
                    >{{ skill.level }}%</span
                  >
                </div>
                <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000 ease-out"
                    [style.width.%]="skill.level"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Soft Skills -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700"
          >
            <h3
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              Soft Skills
            </h3>

            <div class="space-y-4">
              <div *ngFor="let skill of softSkills" class="flex items-center gap-3">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center"
                >
                  <span class="text-sm font-bold text-pink-600 dark:text-pink-400"
                    >{{ skill.level }}%</span
                  >
                </div>
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{
                  skill.name
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Projects -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-12 border border-gray-100 dark:border-slate-700"
        >
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            Proyectos Destacados
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let project of projects"
              class="group relative bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-slate-600"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
              <div class="relative">
                <div class="text-3xl mb-3">{{ project.icon }}</div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {{ project.name }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {{ project.description }}
                </p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    *ngFor="let tech of project.technologies"
                    class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-semibold"
                  >
                    {{ tech }}
                  </span>
                </div>
                <a
                  *ngIf="project.link"
                  [href]="project.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Ver proyecto
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Education & Certifications -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <!-- Education -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700"
          >
            <h3
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
              </div>
              Educación
            </h3>
            <div class="space-y-4">
              <div class="flex gap-4">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
                >
                  <span class="text-xl">🎓</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">Ingeniería en Sistemas</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Universidad Mesoamericana</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    2023 - Actualidad (6 semestres)
                  </p>
                </div>
              </div>
              <div class="flex gap-4">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
                >
                  <span class="text-xl">📚</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">
                    Bachillerato en Computación
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Colegio Santa Mónica</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">2021 - 2022</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700"
          >
            <h3
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              Certificaciones
            </h3>
            <div class="space-y-3">
              <div
                *ngFor="let cert of certifications"
                class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <svg
                  class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ cert.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ cert.issuer }} - {{ cert.date }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div
          class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div class="px-8 py-12 text-center">
            <h2 class="text-3xl font-bold text-white mb-4">¿Quieres conocer más sobre mí?</h2>
            <p class="text-purple-100 text-lg mb-8">
              Visita mi portafolio completo para ver todos mis proyectos y experiencia
            </p>
            <a
              href="https://defiilol11.github.io/byme/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>Ver Portafolio Completo</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class AboutComponent {
  technicalSkills = [
    { name: 'JavaScript / TypeScript', level: 85 },
    { name: 'Python', level: 80 },
    { name: 'SQL / MySQL', level: 80 },
    { name: 'Servicios Web (REST / SOAP)', level: 85 },
    { name: 'DevOps (Git, CI/CD, Azure, AWS)', level: 75 },
    { name: 'C# / .NET', level: 75 },
    { name: 'Laravel / PHP', level: 70 },
    { name: 'Java (Spring)', level: 65 },
  ];

  softSkills = [
    { name: 'Resolución de Problemas', level: 92 },
    { name: 'Comunicación Técnica', level: 88 },
    { name: 'Trabajo en Equipo', level: 85 },
  ];

  projects = [
    {
      icon: '✈️',
      name: 'Deffavia',
      description: 'Sistema de gestión operativa de aviación con DDD, API REST y control de roles.',
      technologies: ['API REST', 'MySQL', 'Git'],
      link: 'https://github.com/Defiilol11/deffavia',
    },
    {
      icon: '🩺',
      name: 'Sistema Hospitalario',
      description: 'Gestión de pacientes, citas, inventario y facturación con RBAC y reportes.',
      technologies: ['API REST', 'SQL Server', 'CI/CD'],
      link: null,
    },
    {
      icon: '🔁',
      name: 'CI/CD con Jenkins',
      description: 'Pipeline declarativo con build, pruebas, despliegue y quality gate.',
      technologies: ['Jenkins', 'SVN', 'Docker'],
      link: null,
    },
    {
      icon: '🗨️',
      name: 'API Microblogging',
      description: 'API estilo Twitter con JWT, validaciones y documentación OpenAPI.',
      technologies: ['Node.js', 'Express', 'JWT'],
      link: null,
    },
    {
      icon: '📦',
      name: 'Envio Cache',
      description: 'App Angular para crear, actualizar y seguir paquetes usando caché local.',
      technologies: ['Angular', 'TypeScript'],
      link: 'https://github.com/Defiilol11/Envio_Cache',
    },
    {
      icon: '💻',
      name: 'App Web Laravel',
      description: 'Gestión de pedidos, inventario y consumo de APIs externas.',
      technologies: ['Laravel', 'PHP', 'MySQL'],
      link: null,
    },
  ];

  certifications = [
    { name: 'Python Development', issuer: 'HackerRank', date: '2024-03' },
    { name: 'C# Development', issuer: 'HackerRank', date: '2024-03' },
    { name: 'Software Engineer', issuer: 'HackerRank', date: '2024-03' },
    { name: 'IoT Proficiency', issuer: 'CISCO', date: '2022-05' },
    { name: 'Cybersecurity Proficiency', issuer: 'CISCO', date: '2022-05' },
  ];
}
