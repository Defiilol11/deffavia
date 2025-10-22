import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeatRecommendation {
  seatCode: string;
  reason: string;
  score: number; // 0-100
}

export interface RecommendationsResponse {
  ok: boolean;
  recommendations: {
    favoriteSeats: string[]; // asientos más reservados por el usuario
    favoriteClass: 'business' | 'economy' | null;
    suggestedSeats: SeatRecommendation[]; // asientos recomendados disponibles
    popularSeats: string[]; // asientos más reservados por todos
    reasoning: string;
  };
}

@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private http = inject(HttpClient);

  /**
   * Obtiene recomendaciones de asientos para un usuario
   */
  getSeatRecommendations(userEmail: string): Observable<RecommendationsResponse> {
    return this.http.get<RecommendationsResponse>('/api/recommendations/seats', {
      params: { userEmail },
    });
  }

  /**
   * Verifica si un asiento está en las recomendaciones
   */
  isRecommended(seatCode: string, recommendations: RecommendationsResponse | null): boolean {
    if (!recommendations) return false;

    const { favoriteSeats, suggestedSeats, popularSeats } = recommendations.recommendations;

    return (
      favoriteSeats.includes(seatCode) ||
      suggestedSeats.some((s) => s.seatCode === seatCode) ||
      popularSeats.includes(seatCode)
    );
  }

  /**
   * Obtiene el motivo de la recomendación
   */
  getRecommendationReason(
    seatCode: string,
    recommendations: RecommendationsResponse | null
  ): string | null {
    if (!recommendations) return null;

    const { favoriteSeats, suggestedSeats, popularSeats } = recommendations.recommendations;

    if (favoriteSeats.includes(seatCode)) {
      return 'Tu asiento favorito';
    }

    const suggested = suggestedSeats.find((s) => s.seatCode === seatCode);
    if (suggested) {
      return suggested.reason;
    }

    if (popularSeats.includes(seatCode)) {
      return 'Asiento popular';
    }

    return null;
  }
}
