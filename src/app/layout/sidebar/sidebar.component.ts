import { Component, Input,Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NzMenuModule, NzIconModule, RouterModule, NzButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  // @Output() toggleCollapsed = new EventEmitter<void>();s
  selectedMenu = 'task-management';
  //  isCollapsed = false;

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  menuItems = [
    { 
      key: 'workspace',
      label: 'Không gian', 
     
      isExpanded: true,
      children: [
        { key: 'assigned-tasks', label: 'Việc được giao', icon: 'ordered-list', link: '/assigned-tasks' },
        { key: 'task-management', label: 'Việc quản lý', icon: 'unordered-list', link: '/tasks' }
      ]
    },
    { key: 'documents', label: 'Tài liệu', icon: 'file', link: '/documents' },
    { key: 'automation', label: 'Automation', icon: 'rocket', link: '/automation' },
    { key: 'ai-agent', label: 'AI Agent', icon: 'robot', link: '/ai-agent' },
  ];

 
}