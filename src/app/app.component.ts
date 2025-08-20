import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ElevatorComponent } from './elevator/elevator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule, ElevatorComponent],
  template: `
    <div class="app-container">
      <h1 class="app-title">🚀 Elevator Simulator 🌟</h1>
      <app-elevator></app-elevator>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-title {
      font-size: 3rem;
      font-weight: bold;
      background: linear-gradient(90deg, #4facfe, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 30px;
    }
  `]
})
export class AppComponent {}
