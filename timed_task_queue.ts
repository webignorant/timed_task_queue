export enum TaskStatus {
  Running = 1,
  Stop = 0,
}

export interface TaskI {
  // task name
  readonly name: string;
  interval: number;
  func: (x: TimedTaskQueue, y: TaskI) => Promise<TaskI>;
  incl_exec: boolean;
  task_before: string;
  task_after: string;
  status: TaskStatus;
  exec_time?: number;
  group_name?: string;
}

export default class TimedTaskQueue {
  private debug: boolean = false;
  private currentTasks: TaskI[] = [];
  private tasks: TaskI[] = [];

  public constructor(interval: number = 1000) {
    const self = this;
    setInterval(() => {
      self.execTask();
    }, interval);
    return this;
  }

  public addTask(taskOptions: TaskI): void {
    const currentTime: number = new Date().getTime();

    const task: TaskI = Object.assign({}, taskOptions);
    task.group_name = taskOptions.group_name || '';
    task.interval = taskOptions.interval || 1000;
    task.exec_time = taskOptions.incl_exec ? (currentTime - taskOptions.interval) : currentTime;
    task.status = TaskStatus.Stop;
    this.tasks.push(task);
  }

  public delTask(name: string): void {
    this.currentTasks = this.currentTasks.filter((item: TaskI) => {
      return item.group_name !== name;
    });
    this.tasks = this.tasks.filter((item: TaskI) => {
      return item.name !== name;
    });
  }

  public delGroupTask(groupName: string): void {
    this.currentTasks = this.currentTasks.filter((item: TaskI) => {
      return item.group_name !== groupName;
    });
    this.tasks = this.tasks.filter((item: TaskI) => {
      return item.group_name !== groupName;
    });
  }

  public getTasks(name: string): undefined | TaskI | TaskI[] {
    if (name) {
      return this.tasks.find((item: TaskI) => {
        return item.name === name;
      });
    }
    return this.tasks;
  }

  public getCurrentTasks(name: string): undefined | TaskI | TaskI[] {
    if (name) {
      return this.currentTasks.find((item: TaskI) => {
        return item.name === name;
      });
    }
    return this.currentTasks;
  }

  public runTask(name: string): void {
    const currentTask: TaskI | undefined = this.currentTasks.find((item: TaskI) => {
      return item.name === name;
    });
    if (!currentTask) {
      const task: TaskI | undefined = this.tasks.find((item: TaskI) => {
        return item.name === name;
      });
      if (!task) {
        return;
      }
      if (task.task_before) {
        const beforeTaskIndex: number = this.currentTasks.findIndex((item: TaskI) => {
          return item.name === task.task_before;
        });
        if (beforeTaskIndex > -1) {
          this.currentTasks.splice(beforeTaskIndex, 0, task);
        } else {
          this.currentTasks.push(task);
        }
        // console.log('[task_before]', beforeTaskIndex, currentTasks);
      } else if (task.task_after) {
        const afterTaskIndex: number = this.currentTasks.findIndex((item: TaskI) => {
          return item.name === task.task_after;
        });
        if (afterTaskIndex > -1) {
          this.currentTasks.splice(afterTaskIndex + 1, 0, task);
        } else {
          this.currentTasks.push(task);
        }
        // console.log('[task_after]', beforeTaskIndex, currentTasks);
      } else {
        this.currentTasks.push(task);
      }
    }
  }

  public stopTask(name): void {
    this.currentTasks = this.currentTasks.filter((item: TaskI) => {
      return item.name !== name;
    });
  }

  public execTask(): void {
    const currentTime: number = new Date().getTime();
    if (!this.currentTasks.length) {
      return;
    }
    for (const task of this.currentTasks) {
      if (task.status) {
        // task is running
        continue;
      }
      if (!task.exec_time) {
        task.exec_time = currentTime;
        continue;
      }
      if ((currentTime - task.exec_time) < task.interval) {
        // require more than interval
        continue;
      }
      task.status = TaskStatus.Running;
      task.exec_time = currentTime;
      try {
        // tslint:disable-next-line:no-shadowed-variable
        task.func(this, task).then((task: TaskI, data?: any) => {
          this.logger(`[taskDone]${task.name} run done`, data);
          return task;
        // tslint:disable-next-line:no-shadowed-variable
        }).catch((task: TaskI, err?: any) => {
          this.logger(`[taskFail]${task.name} run fail`, err);
          return task;
        // tslint:disable-next-line:no-shadowed-variable
        }).then((task: TaskI) => {
          this.logger('[taskAwaly]', task);
          task.status = TaskStatus.Stop;
        });
      } catch (error) {
        this.logger('[taskError]', error);
        task.status = TaskStatus.Stop;
      }
    }
  }

  private logger(...args: any): void {
    if (!this.debug) {
      return;
    }
    if (typeof args === 'object') {
      // tslint:disable-next-line:no-console
      console.log(...args);
    } else {
      // tslint:disable-next-line:no-console
      console.log(args);
    }
  }
}
