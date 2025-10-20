export type SeatClass = 'business' | 'economy';
export type SeatStatus = 'active' | 'free';

export interface SeatDto {
  id: number;
  code: string;
  class: SeatClass;
  seat_status: SeatStatus;
}
