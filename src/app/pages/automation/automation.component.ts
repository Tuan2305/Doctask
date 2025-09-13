import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule, NzEmptyModule, NzIconModule],
  template: `
    <div class="page-container">
      <div class="page-title">
        <span nz-icon nzType="rocket" nzTheme="outline" class="title-icon"></span>
        <h3>Automation</h3>
      </div>
      <div class="empty-state">
        <nz-empty nzText="Danh sách trống !"></nz-empty>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }
    .page-title {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-left: 8px;

      .title-icon {
        font-size: 24px;
        color: #333;
        margin-right: 8px;
      }

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #333;
      }
    }
    .empty-state {
      text-align: center;
      margin-top: 50px;
      background-color: #fff;
      padding: 50px;
      border-radius: 4px;
      border: 1px solid #f0f0f0;
    }
  `]
})
export class AutomationComponent { }