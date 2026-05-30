import { useState } from 'react';
import './QuickAdd.css';

interface QuickAddProps {
  date: string;
  time?: string;
  onClose: () => void;
  onAdd: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ date, time, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [energy, setEnergy] = useState(3);
  const [taskTime, setTaskTime] = useState(time || '09:00');

  const handleAdd = () => {
    if (!title.trim()) return;
    
    const saved = localStorage.getItem(`planner_${date}`);
    const data = saved ? JSON.parse(saved) : { inProgressTasks: [] };
    
    // Проверяем, нет ли уже такой задачи (чтобы избежать дублей)
    const existingTask = data.inProgressTasks?.find((t: any) => t.title === title.trim() && t.time === taskTime);
    if (existingTask) {
      onClose();
      return;
    }
    
    const newTask = {
      id: `${Date.now()}_${Math.random()}`,
      title: title.trim(),
      time: taskTime,
      energy,
      completed: false
    };
    
    if (!data.inProgressTasks) data.inProgressTasks = [];
    data.inProgressTasks = [newTask, ...data.inProgressTasks];
    
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    
    window.dispatchEvent(new Event('tasks-updated'));
    onAdd();
    onClose();
  };

  const getEnergyEmoji = (e: number) => {
    if (e === 1) return '🪫';
    if (e === 2) return '🔋';
    if (e === 3) return '⚡';
    if (e === 4) return '💪';
    return '🔥';
  };

  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div className="quick-add" onClick={e => e.stopPropagation()}>
        <div className="quick-add-header">
          <span>📅 {date} {time && `в ${time}`}</span>
          <button onClick={onClose}>✕</button>
        </div>
        <input
          type="text"
          placeholder="Что нужно сделать?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
        />
        <div className="quick-add-controls">
          <input type="time" value={taskTime} onChange={e => setTaskTime(e.target.value)} />
          <div className="energy-buttons">
            {[1, 2, 3, 4, 5].map(e => (
              <button key={e} className={energy === e ? 'active' : ''} onClick={() => setEnergy(e)}>
                {getEnergyEmoji(e)}
              </button>
            ))}
          </div>
          <button onClick={handleAdd}>➕ Добавить</button>
        </div>
      </div>
    </div>
  );
};

export default QuickAdd;
