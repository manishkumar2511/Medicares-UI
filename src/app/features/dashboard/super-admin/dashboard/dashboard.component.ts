import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimematerialModule } from '../../../../core/primematerial.module';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimematerialModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class SuperAdminDashboardComponent {
  periods = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Yearly', value: '365' }
  ];
  selectedPeriod = '30';

  lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Owners',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        borderColor: '#19B6E6',
        backgroundColor: 'rgba(25, 182, 230, 0.1)',
        tension: 0.4
      }
    ]
  };

  lineChartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
    }
  };
}
