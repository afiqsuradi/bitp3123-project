import * as cron from 'node-cron';
import PrismaDatabase from '../utils/database';
import { BookingStatus } from '@prisma/client';

export class BookingStatusJob {
  private static instance_: BookingStatusJob;
  private database: PrismaDatabase;
  private isRunning: boolean = false;

  constructor() {
    this.database = PrismaDatabase.get();
  }

  static get() {
    if (!BookingStatusJob.instance_) {
      BookingStatusJob.instance_ = new BookingStatusJob();
    }
    return BookingStatusJob.instance_;
  }

  /**
   * Updates booking statuses based on current time:
   * - CONFIRMED bookings past their end time -> COMPLETED
   * - PENDING bookings past their start time -> CANCELLED
   */
  public async updateBookingStatuses(): Promise<void> {
    if (this.isRunning) {
      console.log('Booking status update job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const currentTime = new Date();
    
    try {
      console.log(`[${currentTime.toISOString()}] Starting booking status update job`);

      // Update CONFIRMED bookings that have ended to COMPLETED
      const completedBookingsResult = await this.database.getPrismaClient().booking.updateMany({
        where: {
          status: BookingStatus.CONFIRMED,
          endTime: {
            lt: currentTime
          }
        },
        data: {
          status: BookingStatus.COMPLETED
        }
      });

      // Update PENDING bookings that have started to CANCELLED
      const cancelledBookingsResult = await this.database.getPrismaClient().booking.updateMany({
        where: {
          status: BookingStatus.PENDING,
          startTime: {
            lt: currentTime
          }
        },
        data: {
          status: BookingStatus.CANCELLED
        }
      });

      console.log(`[${currentTime.toISOString()}] Booking status update completed:`, {
        completedBookings: completedBookingsResult.count,
        cancelledBookings: cancelledBookingsResult.count
      });

    } catch (error) {
      console.error(`[${currentTime.toISOString()}] Error updating booking statuses:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Starts the cron job to run every 30 minutes
   */
  public startScheduler(): void {
    // Run every 30 minutes: 0 */30 * * * *
    const task = cron.schedule('0 */30 * * * *', async () => {
      await this.updateBookingStatuses();
    }, {
      timezone: 'UTC'
    });

    console.log('Booking status update job scheduler started (runs every 30 minutes)');
  }

  /**
   * Runs the job immediately on startup
   */
  public async runOnStartup(): Promise<void> {
    console.log('Running booking status update job on system startup...');
    await this.updateBookingStatuses();
  }

  /**
   * Initialize the job scheduler and run on startup
   */
  public async initialize(): Promise<void> {
    // Run immediately on startup
    await this.runOnStartup();
    
    // Start the scheduler for recurring runs
    this.startScheduler();
  }
}
