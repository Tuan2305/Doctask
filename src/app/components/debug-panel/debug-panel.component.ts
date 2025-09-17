// // src/app/components/debug-panel/debug-panel.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { NzSwitchModule } from 'ng-zorro-antd/switch';
// import { NzCardModule } from 'ng-zorro-antd/card';
// import { NzMessageService } from 'ng-zorro-antd/message';
// import { AuthService } from '../../services/auth.service';
// import { environment } from '../../environment/environment';

// @Component({
//   selector: 'app-debug-panel',
//   standalone: true,
//   imports: [
//     CommonModule,
//     NzButtonModule,
//     NzSwitchModule,
//     NzCardModule
//   ],
//   template: `
//     <nz-card 
//       nzTitle="🛠️ Debug Panel" 
//       nzSize="small" 
//       class="debug-panel"
//       *ngIf="!environment.production">
      
//       <div class="debug-info">
//         <p><strong>Mode:</strong> {{ authService.isMockMode() ? '🎭 Mock Mode' : '🌐 Live Mode' }}</p>
//         <p><strong>API URL:</strong> {{ environment.apiUrl }}</p>
//         <p><strong>Backend Status:</strong> 
//           <span [style.color]="backendOnline ? 'green' : 'red'">
//             {{ backendOnline ? '✅ Online' : '❌ Offline' }}
//           </span>
//         </p>
//       </div>

//       <div class="debug-actions">
//         <button nz-button nzType="primary" nzSize="small" (click)="enableMockMode()">
//           🎭 Enable Mock Mode
//         </button>
//         <button nz-button nzType="default" nzSize="small" (click)="checkBackendStatus()">
//           🔄 Check Backend
//         </button>
//         <button nz-button nzType="dashed" nzSize="small" (click)="clearStorage()">
//           🗑️ Clear Storage
//         </button>
//       </div>
//     </nz-card>
//   `,
//   styles: [`
//     .debug-panel {
//       position: fixed;
//       top: 80px;
//       right: 20px;
//       width: 300px;
//       z-index: 9999;
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//     }
    
//     .debug-info {
//       margin-bottom: 16px;
//       font-size: 12px;
//     }
    
//     .debug-actions {
//       display: flex;
//       flex-direction: column;
//       gap: 8px;
//     }
//   `]
// })
// export class DebugPanelComponent {
//   backendOnline = false;
//   environment = environment;

//   constructor(
//     public authService: AuthService,
//     private message: NzMessageService
//   ) {
//     this.checkBackendStatus();
//   }

//   enableMockMode(): void {
//     this.authService.mockLogin();
//     this.message.success('🎭 Mock mode enabled!');
//   }

//   async checkBackendStatus(): Promise<void> {
//     try {
//       const response = await fetch(`${environment.apiUrl}/health`, { 
//         method: 'GET',
//         timeout: 5000 
//       } as any);
//       this.backendOnline = response.ok;
//       this.message.info(this.backendOnline ? '✅ Backend is online' : '❌ Backend is offline');
//     } catch (error) {
//       this.backendOnline = false;
//       this.message.warning('❌ Backend is offline - Using mock mode');
//     }
//   }

//   clearStorage(): void {
//     localStorage.clear();
//     sessionStorage.clear();
//     this.message.success('🗑️ Storage cleared');
//     window.location.reload();
//   }
// }