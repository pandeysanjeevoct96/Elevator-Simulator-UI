import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, switchMap } from 'rxjs';

export enum Direction {
  Down = -1,
  Idle = 0,
  Up = 1
}

export interface ElevatorStatus {
  id: number;
  currentFloor: number;
  direction: Direction;
  stops: number[];
  moveSecondsRemaining: number;
  waitSecondsRemaining: number;
}

export interface RideRequest {
  pickupFloor: number;
  destinationFloor: number;
  desiredDirection: Direction;
}

@Injectable({
  providedIn: 'root'
})
export class ElevatorService {

  private statusSubject = new BehaviorSubject<ElevatorStatus[]>([]);
  status$ = this.statusSubject.asObservable();

  private pollingSubscription: any;  // <-- Use this instead of pollingInterval

  private readonly baseUrl = 'http://localhost:5037/api/Elevator';

  constructor(private http: HttpClient) {}

  /** Request a ride */
  requestRide(fromFloor: number, toFloor: number): Observable<any> {
    const direction: Direction = toFloor > fromFloor ? Direction.Up : Direction.Down;

    const body: RideRequest = {
      pickupFloor: fromFloor,
      destinationFloor: toFloor,
      desiredDirection: direction
    };

    return this.http.post(`${this.baseUrl}/request`, body);
  }

  /** Start simulation on backend and start polling statuses */
  startSimulation(pollMs: number = 1000) {
    if (this.pollingSubscription) return; // Already polling

    // Call backend start endpoint
    this.http.post(`${this.baseUrl}/start`, {}).subscribe({
      next: () => console.log('Simulation started on backend'),
      error: err => console.error('Error starting simulation', err)
    });

    // Start polling elevator statuses
    this.pollingSubscription = interval(pollMs)
      .pipe(
        switchMap(() => this.http.get<ElevatorStatus[]>(`${this.baseUrl}/status`))
      )
      .subscribe({
        next: statuses => this.statusSubject.next(statuses),
        error: err => console.error('Error polling elevator status', err)
      });
  }

  /** Stop simulation on backend and stop polling */
  stopSimulation() {
    // Stop polling properly
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // <-- Properly stop the RxJS interval
      this.pollingSubscription = null;
    }

    // Call backend stop endpoint
    this.http.post(`${this.baseUrl}/stop`, {}).subscribe({
      next: () => {
        console.log('Simulation stopped on backend');
        this.statusSubject.next([]); // Optionally reset statuses
      },
      error: err => console.error('Error stopping simulation', err)
    });
  }
}
