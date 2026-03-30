import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class DashboardComponent implements OnInit, OnDestroy {
  logs: PosEvent[] = [];
  isLoading = true;
  private refreshInterval: any;

  constructor(private logService: LogService) {}

  ngOnInit() {
    this.fetchRealLogs();
    this.refreshInterval = setInterval(() => {
      this.fetchRealLogsSilently();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  fetchRealLogsSilently() {
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.logs = data; 
      },
      error: (err) => console.error('Error en actualización en segundo plano:', err)
    });
  }

  exportToCSV() {
    if (this.logs.length === 0) return;

    const headers = ['ID Evento', 'Nivel', 'Acción', 'Operador', 'Detalles', 'Fecha'];
    const csvRows = [headers.join(',')]; // Primera fila del Excel


    this.logs.forEach(log => {
      const row = [
        log.id,
        log.level,
        log.action,
        log.userName,

        `"${log.details?.replace(/"/g, '""') || ''}"`, 
        new Date(log.timestamp).toLocaleString()
      ];
      csvRows.push(row.join(','));
    });


    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LogPath_Auditoria_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  isSimulating = false; 

  // Función para disparar eventos desde la UI
  simulateEvent(type: 'SUCCESS' | 'ERROR') {
    this.isSimulating = true;

    // Creamos un evento dinámico 
    const newEvent = {
      level: type,
      action: type === 'ERROR' ? 'Falla de Hardware (UI)' : 'Venta Rápida (UI)',
      userId: '777',
      userName: 'Juez_Hackaton',
      details: type === 'ERROR' 
        ? '⚠️ [SIMULACIÓN] La impresora de tickets se atascó. Posible sobrecalentamiento.' 
        : '✅ [SIMULACIÓN] Cobro en efectivo realizado sin problemas. Monto: $450.00 MXN.'
    };

    // Lo mandamos al backend en .NET
    this.logService.createLog(newEvent).subscribe({
      next: () => {
        this.fetchRealLogs(); 
        this.isSimulating = false;
      },
      error: (err) => {
        console.error('Error al simular el evento:', err);
        this.isSimulating = false;
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