import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';
import { User } from '../models/user.model';
import { Progress } from '../models/progress.model';
import { Notification } from '../models/notification.model';
import { map } from 'rxjs/operators';

export interface TaskFilterOptions {
  assigneeId?: number;
  assignerId?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private LS_PREFIX = 'doctask_';
  private LS_USERS_KEY = this.LS_PREFIX + 'users';
  private LS_TASKS_KEY = this.LS_PREFIX + 'tasks';
  private LS_PROGRESS_KEY = this.LS_PREFIX + 'progress';
  private LS_NOTIFICATIONS_KEY = this.LS_PREFIX + 'notifications';
  private LS_CURRENT_USER_KEY = this.LS_PREFIX + 'currentUser';

  private _currentUser = new BehaviorSubject<User | null>(this.getCurrentUserFromLocalStorage());
  currentUser$ = this._currentUser.asObservable();

  constructor() {
    this.initializeMockData(); // Vẫn gọi phương thức này, nhưng nó sẽ rỗng
  }

  // **ĐÃ LÀM RỖNG PHƯƠNG THỨC NÀY**
  private initializeMockData(): void {
    // Không còn khởi tạo dữ liệu mẫu tự động nữa.
    // Dữ liệu sẽ trống rỗng cho đến khi được thêm qua UI hoặc điền thủ công vào localStorage.
    console.log('MockDataService: Not initializing mock data. Local storage will be used as is.');

    // Để đảm bảo người dùng 'admin' luôn có sẵn để đăng nhập nếu localStorage trống hoàn toàn
    // bạn có thể giữ lại đoạn code sau, HOẶC xóa nó nếu bạn muốn tạo người dùng thủ công.
    // Nếu xóa, bạn sẽ không đăng nhập được cho đến khi có user trong localStorage.
    if (!localStorage.getItem(this.LS_USERS_KEY)) {
        const adminUser: User = { userId: 1, username: 'admin', password: 'password', fullName: 'Quản Trị Viên', email: 'admin@example.com', position: 'Admin', createdAt: new Date() };
        localStorage.setItem(this.LS_USERS_KEY, JSON.stringify([adminUser]));
        console.log('MockDataService: Created default admin user for login.');
    }
  }

  // --- User Authentication ---
  login(username: string, password_plain: string): Observable<User | null> {
    const users: User[] = JSON.parse(localStorage.getItem(this.LS_USERS_KEY) || '[]');
    const user = users.find(u => u.username === username && u.password === password_plain);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem(this.LS_CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      this._currentUser.next(userWithoutPassword);
      return of(userWithoutPassword);
    }
    return of(null);
  }

  logout(): void {
    localStorage.removeItem(this.LS_CURRENT_USER_KEY);
    this._currentUser.next(null);
  }

  private getCurrentUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem(this.LS_CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // --- Task Operations ---
  getTasks(options?: TaskFilterOptions): Observable<Task[]> {
    const tasks: Task[] = JSON.parse(localStorage.getItem(this.LS_TASKS_KEY) || '[]');
    const progress: Progress[] = JSON.parse(localStorage.getItem(this.LS_PROGRESS_KEY) || '[]');

    let filteredTasks = tasks.map(task => {
      const taskProgress = progress.find(p => p.taskId === task.taskId);
      // Đảm bảo các trường có giá trị hợp lệ (không undefined)
      return {
        ...task,
        startDate: task.startDate ? new Date(task.startDate) : new Date(),
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        progressPercentage: taskProgress ? taskProgress.percentageComplete : 0,
        status: taskProgress ? (taskProgress.status as TaskStatus) : (task.status || 'pending')
      } as Task;
    });

    if (options?.assigneeId !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.assigneeId === options.assigneeId);
    }
    if (options?.assignerId !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.assignerId === options.assignerId);
    }
    
    if (options?.search) {
      const lowerCaseSearch = options.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseSearch) ||
        (task.description && task.description.toLowerCase().includes(lowerCaseSearch))
      );
    }
    return of(filteredTasks.sort((a,b) => b.taskId - a.taskId));
  }

  getTaskById(taskId: number): Observable<Task | undefined> {
    return this.getTasks(undefined).pipe(
      map(tasks => tasks.find(t => t.taskId === taskId))
    );
  }

  addTask(task: Omit<Task, 'taskId' | 'createdAt' | 'status' | 'progressPercentage'>): Observable<Task> {
    const tasks: Task[] = JSON.parse(localStorage.getItem(this.LS_TASKS_KEY) || '[]');
    const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskId)) + 1 : 1;
    const newTask: Task = {
      ...task,
      taskId: newTaskId,
      createdAt: new Date(),
      status: 'pending',
      progressPercentage: 0
    };
    tasks.push(newTask);
    localStorage.setItem(this.LS_TASKS_KEY, JSON.stringify(tasks));

    const progressRecords: Progress[] = JSON.parse(localStorage.getItem(this.LS_PROGRESS_KEY) || '[]');
    const newProgressId = progressRecords.length > 0 ? Math.max(...progressRecords.map(p => p.progressId)) + 1 : 1;
    progressRecords.push({
      progressId: newProgressId,
      taskId: newTaskId,
      percentageComplete: 0,
      status: 'pending',
      updatedAt: new Date()
    });
    localStorage.setItem(this.LS_PROGRESS_KEY, JSON.stringify(progressRecords));

    this.addNotification({
      userId: newTask.assigneeId,
      message: `Bạn có một nhiệm vụ mới: "${newTask.title}".`,
      taskId: newTask.taskId
    }).subscribe();

    return of(newTask);
  }

  updateTask(updatedTask: Task): Observable<Task> {
    let tasks: Task[] = JSON.parse(localStorage.getItem(this.LS_TASKS_KEY) || '[]');
    const index = tasks.findIndex(t => t.taskId === updatedTask.taskId);
    if (index > -1) {
      // Đảm bảo createdAt luôn là một giá trị hợp lệ
      const createdAtValue = tasks[index].createdAt ? 
        new Date(tasks[index].createdAt) : new Date();
      
      tasks[index] = { 
        ...updatedTask, 
        createdAt: createdAtValue
      };
      
      localStorage.setItem(this.LS_TASKS_KEY, JSON.stringify(tasks));

      this.updateTaskProgress(updatedTask.taskId, updatedTask.progressPercentage || 0, updatedTask.status ?? 'pending').subscribe();

      this.addNotification({
        userId: updatedTask.assigneeId ?? 0,
        message: `Nhiệm vụ "${updatedTask.title}" đã được cập nhật.`,
        taskId: updatedTask.taskId
      }).subscribe();

      return of(tasks[index]);
    }
    return of(updatedTask);
  }

  deleteTask(taskId: number): Observable<boolean> {
    let tasks: Task[] = JSON.parse(localStorage.getItem(this.LS_TASKS_KEY) || '[]');
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.taskId !== taskId);
    localStorage.setItem(this.LS_TASKS_KEY, JSON.stringify(tasks));

    let progressRecords: Progress[] = JSON.parse(localStorage.getItem(this.LS_PROGRESS_KEY) || '[]');
    progressRecords = progressRecords.filter(p => p.taskId !== taskId);
    localStorage.setItem(this.LS_PROGRESS_KEY, JSON.stringify(progressRecords));

    let notifications: Notification[] = JSON.parse(localStorage.getItem(this.LS_NOTIFICATIONS_KEY) || '[]');
    notifications = notifications.filter(n => n.taskId !== taskId);
    localStorage.setItem(this.LS_NOTIFICATIONS_KEY, JSON.stringify(notifications));

    return of(tasks.length < initialLength);
  }

  // --- Progress Operations ---
  updateTaskProgress(taskId: number, percentage: number, status: TaskStatus): Observable<Progress> {
    let progressRecords: Progress[] = JSON.parse(localStorage.getItem(this.LS_PROGRESS_KEY) || '[]');
    let taskProgress = progressRecords.find(p => p.taskId === taskId);

    if (taskProgress) {
      taskProgress.percentageComplete = percentage;
      taskProgress.status = status;
      taskProgress.updatedAt = new Date();
    } else {
      const newProgressId = progressRecords.length > 0 ? Math.max(...progressRecords.map(p => p.progressId)) + 1 : 1;
      taskProgress = {
        progressId: newProgressId,
        taskId: taskId,
        percentageComplete: percentage,
        status: status,
        updatedAt: new Date()
      };
      progressRecords.push(taskProgress);
    }
    localStorage.setItem(this.LS_PROGRESS_KEY, JSON.stringify(progressRecords));

    this.getTaskById(taskId).subscribe(task => {
      if (task) {
        this.updateTask({ ...task, status: status, progressPercentage: percentage }).subscribe();
        this.addNotification({
          userId: task.assigneeId,
          message: `Tiến độ nhiệm vụ "${task.title}" đã cập nhật thành ${percentage}%.`,
          taskId: task.taskId
        }).subscribe();
      }
    });

    return of(taskProgress);
  }

  // --- Notification Operations ---
  getNotifications(userId: number | undefined): Observable<Notification[]> {
    const notifications: Notification[] = JSON.parse(localStorage.getItem(this.LS_NOTIFICATIONS_KEY) || '[]');
    if (userId === undefined) {
      return of([]);
    }
    return of(
      notifications
        .filter(n => n.userId === userId)
        .map(n => ({ ...n, createdAt: new Date(n.createdAt) }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  getUnreadNotificationCount(userId: number | undefined): Observable<number> {
    return this.getNotifications(userId).pipe(
      map(notifications => notifications.filter(n => !n.isRead).length)
    );
  }

  markNotificationAsRead(notificationId: number): Observable<boolean> {
    let notifications: Notification[] = JSON.parse(localStorage.getItem(this.LS_NOTIFICATIONS_KEY) || '[]');
    const index = notifications.findIndex(n => n.notificationId === notificationId);
    if (index > -1) {
      notifications[index].isRead = true;
      localStorage.setItem(this.LS_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      return of(true);
    }
    return of(false);
  }

  addNotification(notificationData: Omit<Notification, 'notificationId' | 'createdAt' | 'isRead'>): Observable<Notification> {
    let notifications: Notification[] = JSON.parse(localStorage.getItem(this.LS_NOTIFICATIONS_KEY) || '[]');
    const newNotificationId = notifications.length > 0 ? Math.max(...notifications.map(n => n.notificationId)) + 1 : 1;
    const newNotification: Notification = {
      notificationId: newNotificationId,
      createdAt: new Date(),
      isRead: false,
      ...notificationData
    };
    notifications.push(newNotification);
    localStorage.setItem(this.LS_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return of(newNotification);
  }

  // --- Other User Operations ---
  getAllUsers(): Observable<User[]> {
    const users: User[] = JSON.parse(localStorage.getItem(this.LS_USERS_KEY) || '[]');
    return of(users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }));
  }

  getUserById(userId: number): Observable<User | undefined> {
    return this.getAllUsers().pipe(
      map(users => users.find(u => u?.userId === userId))
    );
  }
}