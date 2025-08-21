
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElevatorComponent } from './elevator.component';
import { ElevatorService, ElevatorStatus } from '../elevator.service';
import { of, throwError, Subject } from 'rxjs';
import { ElementRef } from '@angular/core';

class MockElevatorService {
  status$ = new Subject<ElevatorStatus[]>();
  requestRide = jasmine.createSpy().and.returnValue(of({ message: 'Ride accepted' }));
  startSimulation = jasmine.createSpy();
  stopSimulation = jasmine.createSpy();
}

describe('ElevatorComponent', () => {
  let component: ElevatorComponent;
  let fixture: ComponentFixture<ElevatorComponent>;
  let elevatorService: MockElevatorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevatorComponent],
      providers: [
        { provide: ElevatorService, useClass: MockElevatorService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElevatorComponent);
    component = fixture.componentInstance;
    elevatorService = TestBed.inject(ElevatorService) as any;
    component.pickupInput = { nativeElement: { value: '', focus: () => {} } } as ElementRef;
    component.destinationInput = { nativeElement: { value: '', focus: () => {} } } as ElementRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to elevator statuses on init', () => {
    const statuses: ElevatorStatus[] = [
      { id: 1, currentFloor: 1, direction: 0, stops: [], moveSecondsRemaining: 0, waitSecondsRemaining: 0 }
    ];
    component.ngOnInit();
    (elevatorService.status$ as Subject<ElevatorStatus[]>).next(statuses);
    expect(component.elevators).toEqual(statuses);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['sub']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(component['sub']!.unsubscribe).toHaveBeenCalled();
  });

  describe('requestRide', () => {
    it('should show error if from or to is null or NaN', () => {
      component.requestRide(null as any, 2);
      expect(component.rideMessageType).toBe('error');
      expect(component.rideMessage).toContain('required and must be valid numbers');
    });

    it('should show error if from or to is out of range', () => {
      component.requestRide(0, 11);
      expect(component.rideMessageType).toBe('error');
      expect(component.rideMessage).toContain('between 1 and 10');
    });

    it('should show error if from and to are the same', () => {
      component.requestRide(3, 3);
      expect(component.rideMessageType).toBe('error');
      expect(component.rideMessage).toContain('must be different');
    });

    it('should call elevatorService.requestRide and handle success', () => {
      elevatorService.requestRide.and.returnValue(of({ message: 'Ride accepted' }));
      component.requestRide(2, 5);
      expect(elevatorService.requestRide).toHaveBeenCalledWith(2, 5);
      expect(component.rideMessage).toBe('Ride accepted');
      expect(component.rideMessageType).toBe('success');
    });

    it('should handle busy message as error', () => {
      elevatorService.requestRide.and.returnValue(of({ message: 'Elevator busy' }));
      component.requestRide(2, 5);
      expect(component.rideMessageType).toBe('error');
    });

    it('should handle error from service', () => {
      elevatorService.requestRide.and.returnValue(throwError(() => ({ error: 'Service error' })));
      component.requestRide(2, 5);
      expect(component.rideMessageType).toBe('error');
      expect(component.rideMessage).toBe('Service error');
    });
  });

  it('should call startSimulation on service', () => {
    component.startSimulation();
    expect(elevatorService.startSimulation).toHaveBeenCalled();
  });

  it('should call stopSimulation on service and clear inputs', () => {
    component.pickupInput.nativeElement.value = '5';
    component.destinationInput.nativeElement.value = '6';
    component.stopSimulation();
    expect(elevatorService.stopSimulation).toHaveBeenCalled();
    expect(component.pickupInput.nativeElement.value).toBe('');
    expect(component.destinationInput.nativeElement.value).toBe('');
  });
});
