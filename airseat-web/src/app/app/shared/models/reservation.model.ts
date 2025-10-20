import { SeatClass } from './seat.model';

export interface ReservationMem {
  id: string;
  userEmail: string;
  seatCode: string;
  seatClass: SeatClass;
  passengerName: string;
  cui: string;
  hasLuggage: boolean;
  price: number;
  modifiers: number;
  discount: number;
  total: number;
  status: 'active' | 'canceled';
  reservedAt: string;
  modifiedCount: number;
  selectionMode: 'manual' | 'random';
}
