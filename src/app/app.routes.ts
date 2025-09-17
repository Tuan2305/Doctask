import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { TaskManagementComponent } from './pages/task-management/task-management.component';
import { AssignedTasksComponent } from './pages/assigned-tasks/assigned-tasks.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { AutomationComponent } from './pages/automation/automation.component';
import { AiAgentComponent } from './pages/ai-agent/ai-agent.component';
import { authGuard, loginGuard } from './guards/auth.guard';
import {RegisterComponent} from './pages/register/register.component';
import { TaskAssignmentComponent } from './pages/task-assignment/task-assignment.component';


export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard] // Chặn người dùng đã đăng nhập
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [loginGuard] // Chặn người dùng đã đăng nhập
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks', component: TaskManagementComponent },
      { path: 'task-assignment', component: TaskAssignmentComponent },
      { path: 'assigned-tasks', component: AssignedTasksComponent },
      {
          path: 'documents', 
          component: DocumentsComponent
        },
      { path: 'automation', component: AutomationComponent },
      { path: 'ai-agent', component: AiAgentComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];