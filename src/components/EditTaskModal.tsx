import { useState } from 'react';
import './EditTaskModal.css';

interface Task {
  id: string;
  title: string;
  time: string;
  energy: number;
  completed: boolean;
}

interface EditTaskModalProps {
  task: Task;
  date: string;
  onClose: () => void;
  onSave: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, date, onClose, onSave }) => {
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

  const getEnergyColor = (e: number) => {
    if (e === 1) return '#10b981';
    if (e === 2) return '#3b82f6';
    if (e === 3) return '#f59e0b';
    if (e === 4) return '#ef4444';
    return '#a855f7';
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"tasks":[]}');
    const taskIndex = data.tasks.findIndex((t: Task) => t.id === task.id);
    
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = { ...task, title: title.trim(), time, energy };
      localStorage.setItem(`planner_${date}`, JSON.stringify(data));
      window.dispatchEvent(new Event('tasks-updated'));
      onSave();
      onClose();
    }
  };

  const handleDelete = () => {
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"tasks":[]}');
    data.tasks = data.tasks.filter((t: Task) => t.id !== task.id);
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    window.dispatchEvent(new Event('tasks-updated'));
    onSave();
    onClose();
  };

  const handleToggleComplete = () => {
    const data = JSON.parse(localStorage.getItem(`planner_${date}`) || '{"tasks":[]}');
    const taskIndex = data.tasks.findIndex((t: Task) => t.id === task.id);
    
    if (taskIndex !== -1) {
      data.tasks[taskIndex].completed = !task.completed;
      localStorage.setItem(`planner_${date}`, JSON.stringify(data));
      window.dispatchEvent(new Event('tasks-updated'));
      onSave();
      onClose();
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>✏️ Редактировать задачу</h3>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className="edit-modal-body">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Название задачи"
            autoFocus
          />
          
          <div className="edit-row">
            <label>⏰ Время</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          
          <div className="edit-row">
            <label>⚡ Энергия</label>
            <div className="energy-buttons">
              {[1, 2, 3, 4, 5].map(e => (
                <button
                  key={e}
                  className={`energy-btn ${energy === e ? 'active' : ''}`}
                  onClick={() => setEnergy(e)}
                  style={{ 
                    background: energy === e ? getEnergyColor(e) : '#0f0f23',
                    borderColor: getEnergyColor(e)
                  }}
                >
                  {getEnergyEmoji(e)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="edit-modal-footer">
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

export default EditTaskModal;
