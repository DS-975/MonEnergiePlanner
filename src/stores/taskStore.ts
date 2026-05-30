import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeTask {
  id: string;
  title: string;
  time: string;
  energy: number;
  completed: boolean;
}

export interface DailyData {
  inProgressTasks: TimeTask[];
  completedTasks: TimeTask[];
  successes: string[];
  thoughts: string[];
}

interface TaskStore {
  dailyData: Record<string, DailyData>;
  addTask: (date: string, task: TimeTask) => void;
  completeTask: (date: string, taskId: string) => void;
  uncompleteTask: (date: string, taskId: string) => void;
  deleteTask: (date: string, taskId: string, fromCompleted: boolean) => void;
  addSuccess: (date: string, success: string) => void;
  addThought: (date: string, thought: string) => void;
  deleteSuccess: (date: string, index: number) => void;
  deleteThought: (date: string, index: number) => void;
  getDailyData: (date: string) => DailyData;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      dailyData: {},
      
      getDailyData: (date: string) => {
        const { dailyData } = get();
        return dailyData[date] || { inProgressTasks: [], completedTasks: [], successes: [], thoughts: [] };
      },
      
      addTask: (date: string, task: TimeTask) => {
        const current = get().dailyData[date] || { inProgressTasks: [], completedTasks: [], successes: [], thoughts: [] };
        set({
          dailyData: {
            ...get().dailyData,
            [date]: {
              ...current,
              inProgressTasks: [...current.inProgressTasks, task]
            }
          }
        });
      },
      
      completeTask: (date: string, taskId: string) => {
        const current = get().dailyData[date];
        if (!current) return;
        
        const task = current.inProgressTasks.find(t => t.id === taskId);
        if (task) {
          set({
            dailyData: {
              ...get().dailyData,
              [date]: {
                ...current,
                inProgressTasks: current.inProgressTasks.filter(t => t.id !== taskId),
                completedTasks: [{ ...task, completed: true }, ...current.completedTasks]
              }
            }
          });
        }
      },
      
      uncompleteTask: (date: string, taskId: string) => {
        const current = get().dailyData[date];
        if (!current) return;
        
        const task = current.completedTasks.find(t => t.id === taskId);
        if (task) {
          set({
            dailyData: {
              ...get().dailyData,
              [date]: {
                ...current,
                completedTasks: current.completedTasks.filter(t => t.id !== taskId),
                inProgressTasks: [{ ...task, completed: false }, ...current.inProgressTasks]
              }
            }
          });
        }
      },
      
      deleteTask: (date: string, taskId: string, fromCompleted: boolean) => {
        const current = get().dailyData[date];
        if (!current) return;
        
        if (fromCompleted) {
          set({
            dailyData: {
              ...get().dailyData,
              [date]: {
                ...current,
                completedTasks: current.completedTasks.filter(t => t.id !== taskId)
              }
            }
          });
        } else {
          set({
            dailyData: {
              ...get().dailyData,
              [date]: {
                ...current,
                inProgressTasks: current.inProgressTasks.filter(t => t.id !== taskId)
              }
            }
          });
        }
      },
      
      addSuccess: (date: string, success: string) => {
        const current = get().dailyData[date] || { inProgressTasks: [], completedTasks: [], successes: [], thoughts: [] };
        set({
          dailyData: {
            ...get().dailyData,
            [date]: {
              ...current,
              successes: [success, ...current.successes]
            }
          }
        });
      },
      
      addThought: (date: string, thought: string) => {
        const current = get().dailyData[date] || { inProgressTasks: [], completedTasks: [], successes: [], thoughts: [] };
        set({
          dailyData: {
            ...get().dailyData,
            [date]: {
              ...current,
              thoughts: [thought, ...current.thoughts]
            }
          }
        });
      },
      
      deleteSuccess: (date: string, index: number) => {
        const current = get().dailyData[date];
        if (!current) return;
        
        set({
          dailyData: {
            ...get().dailyData,
            [date]: {
              ...current,
              successes: current.successes.filter((_, i) => i !== index)
            }
          }
        });
      },
      
      deleteThought: (date: string, index: number) => {
        const current = get().dailyData[date];
        if (!current) return;
        
        set({
          dailyData: {
            ...get().dailyData,
            [date]: {
              ...current,
              thoughts: current.thoughts.filter((_, i) => i !== index)
            }
          }
        });
      }
    }),
    {
      name: 'monenergie-planner', // ключ в localStorage
    }
  )
);