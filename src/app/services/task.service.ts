import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { Task, TaskApiResponse, TaskStatus } from '../models/task.model';
import { TaskReviewResponse } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private baseUrl = `${environment.apiUrl}/api/v2/GetListTask`;
  private baseUrl1 = `${environment.apiUrl}/api/v2`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getTasksByAssignee(page: number = 1, pageSize: number = 10, searchText?: string): Observable<{
    items: Task[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchText) {
      params = params.set('search', searchText);
    }

    return this.http.get<TaskApiResponse>(
      `${this.baseUrl}/by-assignee`, 
      { params, ...this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Không thể lấy danh sách nhiệm vụ');
        }
        
        // Chuẩn hóa dữ liệu
        const tasks = response.data.items.map(task => {
          const status: TaskStatus = 
            (task.percentageComplete === 100) ? 'completed' : 
            (task.percentageComplete !== undefined && task.percentageComplete > 0) ? 'in_progress' : 
            'pending';
          
          return {
            ...task,
            progressPercentage: task.percentageComplete,
            daysOfWeek: task.dayOfWeek,
            status: status
          } as Task;
        });

        return {
          items: tasks,
          totalCount: response.data.totalItems,
          page: response.data.page || response.data.currentPage || page,
          pageSize: response.data.pageSize
        };
      }),
      catchError(error => {
        console.error('Error fetching tasks by assignee:', error);
        return of({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 10
        });
      })
    );
  }

  getTasksByAssigner(page: number = 1, pageSize: number = 10, searchText?: string): Observable<{
    items: Task[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchText) {
      params = params.set('search', searchText);
    }

    return this.http.get<TaskApiResponse>(
      `${this.baseUrl}/by-assignedby`,
      { params, ...this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Không thể lấy danh sách nhiệm vụ');
        }
        
        // Chuẩn hóa dữ liệu
        const tasks = response.data.items.map(task => {
          const status: TaskStatus = 
            (task.percentageComplete === 100) ? 'completed' : 
            (task.percentageComplete !== undefined && task.percentageComplete > 0) ? 'in_progress' : 
            'pending';
            
          return {
            ...task,
            progressPercentage: task.percentageComplete,
            status: status
          } as Task;
        });

        return {
          items: tasks,
          totalCount: response.data.totalItems,
          page: response.data.currentPage || response.data.page || page,
          pageSize: response.data.pageSize
        };
      }),
      catchError(error => {
        console.error('Error fetching tasks by assigner:', error);
        return of({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 10
        });
      }) 
    );
  }

    getTaskDetailById(taskId: number): Observable<any> {
    // Với baseUrl đúng, URL sẽ là: http://192.168.1.181:8888/api/v2/review/by-task?taskId=...
    return this.http.get<any>(`${this.baseUrl1}/review/by-task`, { params: { taskId: taskId.toString() } });
  }


  getTasksByParent(parentTaskId: number, page: number = 1, pageSize: number = 10): Observable<{
    items: Task[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    const params = new HttpParams()
      .set('parentTaskId', parentTaskId.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<TaskApiResponse>(
      `${this.baseUrl}/by-parent`, 
      { params, ...this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Không thể lấy danh sách nhiệm vụ con');
        }
        
        // Chuẩn hóa dữ liệu
        const tasks = response.data.items.map(task => {
          const status: TaskStatus = 
            (task.percentageComplete === 100) ? 'completed' : 
            (task.percentageComplete !== undefined && task.percentageComplete > 0) ? 'in_progress' : 
            'pending';
            
          return {
            ...task,
            progressPercentage: task.percentageComplete,
            daysOfWeek: task.dayOfWeek,
            status: status
          } as Task;
        });

        return {
          items: tasks,
          totalCount: response.data.totalItems,
          page: response.data.currentPage || response.data.page || page,
          pageSize: response.data.pageSize
        };
      }),
      catchError(error => {
        console.error('Error fetching tasks by parent:', error);
        return of({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 10
        });
      })
    );
  }

  // Thêm phương thức cập nhật tiến độ nhiệm vụ
  updateTaskProgress(taskId: number, percentageComplete: number, status: TaskStatus): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/v2/taskUpdate/update-progress`, 
      { 
        taskId, 
        percentageComplete,
        status
      },
      this.getAuthHeaders()
    );
  }

  getTaskReviews(taskId: number): Observable<TaskReviewResponse> {
    return this.http.get<TaskReviewResponse>(
      `${this.baseUrl1}/review/by-task`,
      { params: { taskId: taskId.toString() } }
    );
  }

  getTaskReviewFrequency(
    taskId: number,
    startDate: string, // Định dạng ISO string
    endDate: string,   // Định dạng ISO string
    page: number = 1,
    pageSize: number = 10
  ): Observable<TaskReviewResponse> {
    const params = {
      taskId: taskId.toString(),
      startDate: startDate,
      endDate: endDate,
      page: page.toString(),
      pageSize: pageSize.toString()
    };
    return this.http.get<TaskReviewResponse>(`${this.baseUrl}/review/by-task-frequency`, { params });
  }

  getTaskParentDetail(parentTaskId: number): Observable<any> {
  return this.http.get<any>(
    `http://192.168.2.180:8888/api/v2/review/detail-TaskParent?parentTaskId=${parentTaskId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    }
  );
}

}