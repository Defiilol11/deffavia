export interface AppUser {
  id: string; // UUID en memoria
  email: string;
  password: string; // en memoria SOLAMENTE (no en backend)
  createdAt: string;
  reservationsCount: number; // para VIP
}
