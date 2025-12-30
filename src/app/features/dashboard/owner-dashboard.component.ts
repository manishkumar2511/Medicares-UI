import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../core/primematerial.module';

@Component({
    selector: 'app-owner-dashboard',
    standalone: true,
    imports: [CommonModule, PrimematerialModule],
    templateUrl: './owner-dashboard.component.html',
    styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent implements OnInit {
    public chartData: any;
    public chartOptions: any;
    public pieData: any;
    public pieOptions: any;

    public statsCards = [
        { title: 'Total Pharmacies', value: '12', icon: 'pi pi-home', color: '#19B6E6', trend: '+2', trendIcon: 'pi pi-arrow-up' },
        { title: 'Active Pharmacists', value: '45', icon: 'pi pi-users', color: '#4CAF50', trend: '+5', trendIcon: 'pi pi-arrow-up' },
        { title: 'Today\'s Sales', value: '$3,850', icon: 'pi pi-shopping-cart', color: '#FF9800', trend: '+12%', trendIcon: 'pi pi-arrow-up' },
        { title: 'Low Stock Alerts', value: '8', icon: 'pi pi-exclamation-triangle', color: '#F44336', trend: 'Critical', trendIcon: 'pi pi-info-circle' }
    ];

    public pharmacySchedules = [
        { name: 'City Central Pharmacy', time: '09:00 AM - 06:00 PM', address: '123 Medical Square, Downtown' },
        { name: 'Green Valley Meds', time: '10:00 AM - 08:00 PM', address: '45 Garden Road, North Side' },
        { name: 'Sunrise Health Hub', time: '08:00 AM - 10:00 PM', address: '88 Sunrise Blvd, East End' }
    ];

    public deliverySchedules = [
        { orderId: 'ORD-7721', time: 'Expected by 2:00 PM', address: 'Patient: Amit Sharma | Batch #A-22' },
        { orderId: 'ORD-7725', time: 'Expected by 4:30 PM', address: 'Patient: Priya Verma | Batch #B-09' }
    ];

    public recentActivities = [
        { title: 'Stock Updated', summary: 'Paracetamol 500mg (500 units)', eventTime: new Date() },
        { title: 'Low Stock Alert', summary: 'Insulin Syringes (Critical)', eventTime: new Date(Date.now() - 3600000) },
        { title: 'New Sale', summary: 'Order #7728 - $145.50', eventTime: new Date(Date.now() - 7200000) }
    ];

    public recentReports = [
        { id: 'SALES_DEC_2025', name: 'Sales_Report_Dec_2025.pdf' },
        { id: 'INV_DEC_2025', name: 'Inventory_Audit_Dec_2025.pdf' }
    ];

    ngOnInit() {
        this.initCharts();
    }

    public downloadReport(report: any) {
        console.log('Downloading report:', report);
    }

    private initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        // Correctly handle CSS variables
        const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#19B6E6';
        const textColor = documentStyle.getPropertyValue('--text-primary') || '#212121';
        const textColorSecondary = documentStyle.getPropertyValue('--text-secondary') || '#757575';
        const surfaceBorder = documentStyle.getPropertyValue('--border-color') || '#E0E0E0';

        this.chartData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Weekly Sales ($)',
                    data: [1200, 1900, 1500, 2100, 2400, 3100, 2800],
                    fill: true,
                    borderColor: primaryColor,
                    tension: 0.4,
                    backgroundColor: primaryColor.includes('#') ? primaryColor + '20' : 'rgba(25, 182, 230, 0.1)'
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.pieData = {
            labels: ['Medicines', 'Surgicals', 'Consumer', 'Others'],
            datasets: [
                {
                    data: [45, 25, 20, 10],
                    backgroundColor: [primaryColor, '#4CAF50', '#FF9800', '#9C27B0'],
                    hoverBackgroundColor: [primaryColor, '#66BB6A', '#FFA726', '#AB47BC']
                }
            ]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }
}
