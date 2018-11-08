# timed_task_queue
timed_task_queue by typescript

### how to use
```js
import TimedTaskQueue from './timed_task_queue';

const timedTaskQueue = new TimedTaskQueue();
// or set interval is 2000
const timedTaskQueue2 = new TimedTaskQueue(2000);

// task1
// task interval is 10s
const test1TaskName = 'task_test1';
timedTaskQueue.addTask({
  name: test1TaskName,
  interval: 10000,
  func: function(timedTaskQueue, task) {
    return new Promise((resolve, reject) => {
      console.log(`[task]${test1TaskName}, interval ${task.interval}.`, new Date(), task);
      resolve(task);
    });
  },
});
timedTaskQueue.runTask(test1TaskName);

// task1
// task interval is 15s
const test2TaskName = 'task_test2';
timedTaskQueue.addTask({
  name: test2TaskName,
  group_name: 'other_group_name',
  interval: 15000,
  func: function(timedTaskQueue, task) {
    return new Promise((resolve, reject) => {
      console.log(`[task]${test2TaskName}, interval ${task.interval}.`, new Date(), task);
      resolve(task);
    });
  },
});
timedTaskQueue.runTask(test2TaskName);

// if you will close task, you can use delTask
timedTaskQueue.delTask(test1TaskName);
// you can close task by group
timedTaskQueue.delGroupTask('other_group_name');
```
