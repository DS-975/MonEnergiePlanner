import { useState } from 'react';
import './TaskEditor.css';

interface Task {
  id: string;
  title: string;
  time: string;
  energy: number;
  completed: boolean;
}

interface TaskEditorProps {
  task: Task;
  date: string;
  onClose: () => void;
  onSave: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, date, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time);
  const [energy, setEnergy] = useState(task.energy);

  const getEnergyEmoji = (e: number) => {
    if (e === 1) return '🪫';
    if (e === 2) return '🔋';
    if (e === 3) return '⚡';
    if (e === 4) return '💪';
    return '🔥';
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"inProgressTasks":[],"completedTasks":[]}');
    
    // Обновляем задачу в нужном списке
    if (task.completed) {
      const index = data.completedTasks.findIndex((t: Task) => t.id === task.id);
      if (index !== -1) {
        data.completedTasks[index] = { ...task, title: title.trim(), time, energy };
      }
    } else {
      const index = data.inProgressTasks.findIndex((t: Task) => t.id === task.id);
      if (index !== -1) {
        data.inProgressTasks[index] = { ...task, title: title.trim(), time, energy };
      }
    }
    
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    window.dispatchEvent(new Event('tasks-updated'));
    onSave();
    onClose();
  };

  const handleDelete = () => {
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"inProgressTasks":[],"completedTasks":[]}');
    
    if (task.completed) {
      data.completedTasks = data.completedTasks.filter((t: Task) => t.id !== task.id);
    } else {
      data.inProgressTasks = data.inProgressTasks.filter((t: Task) => t.id !== task.id);
    }
    
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    window.dispatchEvent(new Event('tasks-updated'));
    onSave();
    onClose();
  };

  const handleToggleComplete = () => {
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"inProgressTasks":[],"completedTasks":[]}');
    
    if (task.completed) {
      // Перемещаем из Готово в В процессе
      data.completedTasks = data.completedTasks.filter((t: Task) => t.id !== task.id);
      data.inProgressTasks = [{ ...task, completed: false }, ...data.inProgressTasks];
    } else {
      // Перемещаем из В процессе в Готово
      data.inProgressTasks = data.inProgressTasks.filter((t: Task) => t.id !== task.id);
      data.completedTasks = [{ ...task, completed: true }, ...data.completedTasks];
    }
    
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    window.dispatchEvent(new Event('tasks-updated'));
    onSave();
    onClose();
  };

  return (
    <div className="task-editor-overlay" onClick={onClose}>
      <div className="task-editor" onClick={e => e.stopPropagation()}>
        <div className="task-editor-header">
          <h3>✏️ Редактировать задачу</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="task-editor-input"
          placeholder="Название задачи"
          autoFocus
        />
        
        <div className="task-editor-row">
          <label>⏰ Время</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        
        <div className="task-editor-row">
          <label>⚡ Энергия</label>
          <div className="energy-buttons">
            {[1, 2, 3, 4, 5].map(e => (
              <button
                key={e}
                className={`energy-btn ${energy === e ? 'active' : ''}`}
                onClick={() => setEnergy(e)}
              >
                {getEnergyEmoji(e)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="task-editor-actions">
          <button onClick={handleToggleComplete} className="toggle-btn">
            {task.completed ? '↩️ Вернуть в процесс' : '✅ Отметить готово'}
          </button>
          <button onClick={handleDelete} className="delete-btn">
            🗑️ Удалить
          </button>
          <button onClick={handleSave} className="save-btn">
            💾 Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
