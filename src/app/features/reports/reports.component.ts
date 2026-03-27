import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../core/primematerial.module';
import { MESSAGES } from '../../core/constants/messages.const';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  public messages = MESSAGES.REPORTS;
  public loading = signal<boolean>(false);

  

 
  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  exportReport(type: string) {
    console.log(`Exporting ${type} report...`);
  }
}
