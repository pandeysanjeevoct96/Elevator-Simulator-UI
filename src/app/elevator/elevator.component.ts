import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ElevatorService, ElevatorStatus } from '../elevator.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elevator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elevator.component.html',
  styleUrls: ['./elevator.component.scss']
})
export class ElevatorComponent implements OnInit, OnDestroy {
  elevators: ElevatorStatus[] = [];
  private sub: Subscription | undefined;

  @ViewChild('pickup') pickupInput!: ElementRef;
  @ViewChild('destination') destinationInput!: ElementRef;

  rideMessage: string = '';
  rideMessageType: 'success' | 'error' = 'success';

  constructor(private elevatorService: ElevatorService) { }

  ngOnInit() {
    // Subscribe to live statuses
    this.sub = this.elevatorService.status$.subscribe(statuses => {
      this.elevators = statuses;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  requestRide(from: number, to: number) {

    if (from == null || to == null || isNaN(from) || isNaN(to)) {
      this.rideMessageType = 'error';
      this.rideMessage = 'Pickup and destination floors are required and must be valid numbers.';
      setTimeout(() => {
        this.rideMessage = '';
      }, 5000);
      return;
    }

    if (from < 1 || from > 10 || to < 1 || to > 10) {
      this.rideMessageType = 'error';
      this.rideMessage = 'Pickup and destination floors must be between 1 and 10';
      if (this.pickupInput) this.pickupInput.nativeElement.value = '';
      if (this.destinationInput) this.destinationInput.nativeElement.value = '';
      setTimeout(() => {
        this.rideMessage = '';
      }, 5000);
      return;
    }

    if (from === to) {
      this.rideMessageType = 'error';
      this.rideMessage = 'Pickup and destination floors must be different.';
      if (this.pickupInput) this.pickupInput.nativeElement.value = '';
      if (this.destinationInput) this.destinationInput.nativeElement.value = '';
      setTimeout(() => {
        this.rideMessage = '';
      }, 5000);
      return;
    }

    this.elevatorService.requestRide(from, to).subscribe({
      next: (res) => {
        this.rideMessage = res.message;
        this.rideMessageType = res.message.toLowerCase().includes('busy') ? 'error' : 'success';
        setTimeout(() => {
          this.rideMessage = '';
        }, 5000);
      },
      error: (err) => {
        this.rideMessageType = 'error';
        this.rideMessage = err.error;
        setTimeout(() => {
          this.rideMessage = '';
        }, 5000);
      }
    });
  }

  startSimulation() {
    this.elevatorService.startSimulation();
  }

  stopSimulation() {
    this.elevatorService.stopSimulation();

    if (this.pickupInput) this.pickupInput.nativeElement.value = '';
    if (this.destinationInput) this.destinationInput.nativeElement.value = '';
  }
}
