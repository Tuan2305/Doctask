// src/app/services/task-assignment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task.model';

export interface SubordinateUser {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  orgId: number;
  unitId: number;
  userParent: number;
}

export interface Unit {
  unitId: number;
  unitName: string;
  orgId?: number;
}

// Đảm bảo export interface này
export interface SubordinateUsersResponse {
  success: boolean;
  message: string;
  data: {
    subordinates: SubordinateUser[];
    peers: SubordinateUser[];
  };
  error: string | null;
}

export interface ChildTaskCreateRequest {
  title: string;
  description: string;
  assigneeIds: number[];
  unitIds: number[];
  startDate: Date;
  endDate: Date;
  frequencyType: string;
  intervalValue: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  parentTaskId: number;
}
export interface CreateParentTaskRequest {
  title: string;
  description: string;
  priority: string;
  startDate: Date;
  dueDate: Date;
}
export interface CreateParentTaskResponse {
  success: boolean;
  message: string;
  data: {
    taskId: number;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: string;
  };
  error: string | null;
}

export interface UpdateParentTaskRequest {
  title: string;
  description: string;
  startDate: Date;
  dueDate: Date;
}

export interface UpdateParentTaskResponse {
  success: boolean;
  message: string;
  data: {
    taskId: number;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
  };
}


@Injectable({
  providedIn: 'root'
})
export class TaskAssignmentService {
  private baseUrl = 'http://localhost:5168/api/v2/taskAssignment';

  constructor(private http: HttpClient) { }

  getSubordinateUsers(): Observable<SubordinateUsersResponse> {
    return this.http.get<SubordinateUsersResponse>(`${this.baseUrl}/get-subs-user-current`, {
      headers: this.getAuthHeaders()
    });
  }

  // Thêm method để update parent task
  updateParentTask(taskId: number, request: UpdateParentTaskRequest): Observable<UpdateParentTaskResponse> {
    console.log('API Update Request:', request);
    
    return this.http.put<UpdateParentTaskResponse>(`${this.baseUrl}/update-parenttask?taskId=${taskId}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('API Update Response:', response)),
      catchError(error => {
        console.error('API Update Error:', error);
        throw error;
      })
    );
  }

  getSubordinateUnits(): Observable<Unit[]> {
    const mockUnits: Unit[] = [
      { unitId: 1, unitName: 'Phòng Kỹ thuật', orgId: 1 },
      { unitId: 2, unitName: 'Phòng Kinh doanh', orgId: 1 },
      { unitId: 3, unitName: 'Phòng Nhân sự', orgId: 1 }
    ];
    return new Observable(observer => {
      observer.next(mockUnits);
      observer.complete();
    });
  }

  createChildTask(request: ChildTaskCreateRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-child-task`, request, {
      headers: this.getAuthHeaders()
    });
  }

  createParentTask(request: CreateParentTaskRequest): Observable<CreateParentTaskResponse> {
    console.log('API Request:', request); // Debug log
    
    return this.http.post<CreateParentTaskResponse>(`${this.baseUrl}/create-parentTask`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('API Response:', response)), // Debug log
      catchError(error => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }


  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

// Cập nhật method này để gọi API thực tế
  getParentTasks(): Observable<Task[]> {
    return this.http.get<any>(`${this.baseUrl}/get-parent-tasks`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.data.items || response.data || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching parent tasks:', error);
        return of([]);
      })
    );
  }

  // Hoặc nếu chưa có API riêng, sử dụng API getTasksByAssigner
  // getParentTasksByAssigner(page: number = 1, pageSize: number = 50): Observable<Task[]> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('pageSize', pageSize.toString());

  //   return this.http.get<any>(`http://192.168.1.180:8888/api/v2/task/by-assigner`, {
  //     params,
  //     headers: this.getAuthHeaders()
  //   }).pipe(
  //     map(response => {
  //       if (response.success) {
  //         // Lọc chỉ lấy parent tasks (không có parentTaskId)
  //         const allTasks = response.data.items || [];
  //         return allTasks.filter((task: any) => !task.parentTaskId);
  //       }
  //       return [];
  //     }),
  //     catchError(error => {
  //       console.error('Error fetching parent tasks by assigner:', error);
  //       return of([]);
  //     })
  //   );
  // }
}
