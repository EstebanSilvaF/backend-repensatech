import { reservationService } from '../services/reservation.service';

import cron from 'node-cron';
cron.schedule('0 * * * *', async() => { await expireReservationsCron() });

export async function expireReservationsCron(): Promise<void> {
  try {
    await reservationService.expireOverdue();
  } catch (err) {
    console.error('Error en cron de reservas:', err);
  }
}
