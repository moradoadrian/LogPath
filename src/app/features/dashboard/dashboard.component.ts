import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from './services/log.service';

export interface PosEvent {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'ERROR' | 'WARN' | 'SUCCESS';
  action: string;
  userId: string;
  userName: string;
  details: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  totalEvents = 0;
  totalSales = 15750; 
  criticalErrors = 0;
  currentFilter: 'ALL' | 'ERROR' = 'ALL';
  

  recentEvents: PosEvent[] = [];


  constructor(private logService: LogService) {}


  ngOnInit() {
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.recentEvents = data;
        this.totalEvents = data.length;
        this.criticalErrors = data.filter(e => e.level === 'ERROR').length;
      },
      error: (err) => console.error('Error al cargar logs:', err)
    });
  }

  get filteredEvents() {
    if (this.currentFilter === 'ERROR') {
      return this.recentEvents.filter(event => event.level === 'ERROR');
    }
    return this.recentEvents;
  }

  setFilter(filter: 'ALL' | 'ERROR') {
    this.currentFilter = filter;
  }
}