import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogService } from './services/log.service'; 

export interface PosEvent {
  id?: string;
  level: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  logs: PosEvent[] = [];
  isLoading = true;

  constructor(private logService: LogService) {}

  ngOnInit() {
    this.fetchRealLogs();
  }

  // ¡Llamada a API en .NET 10 para obtener logs reales de PostgreSQL!
  fetchRealLogs() {
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al conectar con la base de datos:', err);
        this.isLoading = false;
      }
    });
  }

  // KPIs basados en datos reales de PostgreSQL
  get successCount(): number {
    return this.logs.filter(log => log.level === 'SUCCESS').length;
  }

  get alertCount(): number {
    return this.logs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL').length;
  }

  get uniqueOperators(): number {
    return new Set(this.logs.map(log => log.userName)).size;
  }
  getEventTypeClass(level: string): string {
    switch (level?.toUpperCase()) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-800 ring-emerald-600/10';
      case 'ERROR': return 'bg-red-100 text-red-800 ring-red-600/10';
      case 'WARNING': return 'bg-amber-100 text-amber-800 ring-amber-600/10';
      case 'INFO': return 'bg-blue-100 text-blue-800 ring-blue-600/10';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/10';
    }
  }
}