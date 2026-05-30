import { useState, useEffect } from 'react';
import './DailyEditor.css';

interface Task {
  id: string;
  title: string;
  time: string;
  energy: number;
  completed: boolean;
}

interface DailyEditorProps {
  date: string;
  onClose: () => void;
  onSave?: () => void;
}

const DailyEditor: React.FC<DailyEditorProps> = ({ date, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'success' | 'thoughts' | 'someday'>('tasks');
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [somedayTasks, setSomedayTasks] = useState<Task[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskEnergy, setNewTaskEnergy] = useState(3);
  const [newEntry, setNewEntry] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const dayOfWeek = new Date(date).toLocaleDateString('ru-RU', { weekday: 'long' });

  useEffect(() => {
    const saved = localStorage.getItem(`planner_${date}`);
    if (saved) {
      const data = JSON.parse(saved);
      setInProgressTasks(data.inProgressTasks || []);
      setCompletedTasks(data.completedTasks || []);
      setSuccesses(data.successes || []);
      setThoughts(data.thoughts || []);
    }
    
    const someday = localStorage.getItem('planner_someday');
    if (someday) {
      setSomedayTasks(JSON.parse(someday));
    }
  }, [date]);

  const saveData = () => {
    const data = {
      inProgressTasks,
      completedTasks,
      successes,
      thoughts
    };
    localStorage.setItem(`planner_${date}`, JSON.stringify(data));
    localStorage.setItem('planner_someday', JSON.stringify(somedayTasks));
    
    window.dispatchEvent(new Event('tasks-updated'));
    if (onSave) onSave();
    onClose();
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy === 1) return '🪫';
    if (energy === 2) return '🔋';
    if (energy === 3) return '⚡';
    if (energy === 4) return '💪';
    return '🔥';
  };

  const getEnergyColor = (energy: number) => {
    if (energy === 1) return '#10b981';
    if (energy === 2) return '#3b82f6';
    if (energy === 3) return '#f59e0b';
    if (energy === 4) return '#ef4444';
    return '#a855f7';
  };

  const handleAddTask = (isSomeday = false) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `${Date.now()}_${Math.random()}`,
      title: newTaskTitle,
      time: isSomeday ? '—' : newTaskTime,
      energy: newTaskEnergy,
      completed: false
    };
    
    if (isSomeday) {
      setSomedayTasks([...somedayTasks, newTask]);
    } else {
      setInProgressTasks([...inProgressTasks, newTask]);
    }
    
    setNewTaskTitle('');
    setNewTaskTime('09:00');
    setNewTaskEnergy(3);
  };

  const handleDragStart = (task: Task, fromSomeday = false) => {
    setDraggedTask({ ...task, fromSomeday: fromSomeday as any });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToTime = (time: string) => {
    if (draggedTask) {
      if ((draggedTask as any).fromSomeday) {
        setSomedayTasks(somedayTasks.filter(t => t.id !== draggedTask.id));
      } else {
        setInProgressTasks(inProgressTasks.filter(t => t.id !== draggedTask.id));
        setCompletedTasks(completedTasks.filter(t => t.id !== draggedTask.id));
      }
      
      const updatedTask = { ...draggedTask, time };
      setInProgressTasks([updatedTask, ...inProgressTasks]);
      setDraggedTask(null);
    }
  };

  const handleMoveToSomeday = (task: Task) => {
    setInProgressTasks(inProgressTasks.filter(t => t.id !== task.id));
    setCompletedTasks(completedTasks.filter(t => t.id !== task.id));
    setSomedayTasks([{ ...task, time: '—' }, ...somedayTasks]);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = inProgressTasks.find(t => t.id === taskId);
    if (task) {
      setInProgressTasks(inProgressTasks.filter(t => t.id !== taskId));
      setCompletedTasks([{ ...task, completed: true }, ...completedTasks]);
    }
  };

  const handleUncompleteTask = (taskId: string) => {
    const task = completedTasks.find(t => t.id === taskId);
    if (task) {
      setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
      setInProgressTasks([{ ...task, completed: false }, ...inProgressTasks]);
    }
  };

  const handleDeleteTask = (taskId: string, fromCompleted = false, fromSomeday = false) => {
    if (fromSomeday) {
      setSomedayTasks(somedayTasks.filter(t => t.id !== taskId));
    } else if (fromCompleted) {
      setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
    } else {
      setInProgressTasks(inProgressTasks.filter(t => t.id !== taskId));
    }
  };

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    
    if (activeTab === 'success') {
      setSuccesses([newEntry, ...successes]);
    } else if (activeTab === 'thoughts') {
      setThoughts([newEntry, ...thoughts]);
    }
    setNewEntry('');
  };

  const handleDeleteEntry = (index: number, type: 'success' | 'thoughts') => {
    if (type === 'success') {
      setSuccesses(successes.filter((_, i) => i !== index));
    } else {
      setThoughts(thoughts.filter((_, i) => i !== index));
    }
  };

  // Генерируем временные слоты: 01:00, 01:30, 02:00, 02:30 и т.д.
  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    timeSlots.push({ hour: `${hour}:00`, half: `${hour}:30` });
  }

  return (
    <div className="daily-editor-overlay" onClick={saveData}>
      <div className="daily-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <div className="editor-date">
            <h2>{formattedDate}</h2>
            <span className="day-of-week">{dayOfWeek}</span>
          </div>
          <button className="close-btn" onClick={saveData}>✕</button>
        </div>

        <div className="editor-tabs">
          <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            📋 Ежедневник
          </button>
          <button className={`tab ${activeTab === 'someday' ? 'active' : ''}`} onClick={() => setActiveTab('someday')}>
            🗓️ Когда-нибудь
          </button>
          <button className={`tab ${activeTab === 'success' ? 'active' : ''}`} onClick={() => setActiveTab('success')}>
            🌟 Успехи
          </button>
          <button className={`tab ${activeTab === 'thoughts' ? 'active' : ''}`} onClick={() => setActiveTab('thoughts')}>
            💭 Мысли
          </button>
        </div>

        <div className="editor-content">
          {activeTab === 'tasks' && (
            <div className="tasks-section">
              <div className="add-task-form">
                <input
                  type="text"
                  placeholder="Что нужно сделать?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="task-title-input"
                />
                
                <div className="task-controls">
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="time-input"
                  />
                  
                  <div className="energy-selector-small">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        className={`energy-badge ${newTaskEnergy === level ? 'active' : ''}`}
                        onClick={() => setNewTaskEnergy(level)}
                      >
                        {getEnergyEmoji(level)}
                      </button>
                    ))}
                  </div>
                  
                  <button onClick={() => handleAddTask(false)} className="add-task-btn">+ Добавить</button>
                </div>
              </div>

              <div className="time-grid" onDragOver={handleDragOver}>
                <h3>⏰ Раскидать по времени</h3>
                <div className="time-slots-grid">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="time-slot-pair">
                      <div
                        className="time-slot-drop hour-slot"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropToTime(slot.hour)}
                      >
                        <span className="time-label">{slot.hour}</span>
                      </div>
                      <div
                        className="time-slot-drop half-slot"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropToTime(slot.half)}
                      >
                        <span className="time-label-half">{slot.half.split(':')[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="task-group">
                <div className="task-group-header">
                  <span className="group-icon">⚙️</span>
                  <h3>В процессе</h3>
                  <span className="task-count">{inProgressTasks.length}</span>
                </div>
                <div className="tasks-list">
                  {inProgressTasks.length === 0 ? (
                    <p className="empty-message">Нет активных задач</p>
                  ) : (
                    inProgressTasks.map(task => (
                      <div
                        key={task.id}
                        className="task-card"
                        draggable
                        onDragStart={() => handleDragStart(task, false)}
                      >
                        <div className="task-time" style={{ borderColor: getEnergyColor(task.energy) }}>
                          {task.time}
                        </div>
                        <div className="task-content">
                          <span className="task-title">{task.title}</span>
                          <span className="task-energy">{getEnergyEmoji(task.energy)}</span>
                        </div>
                        <div className="task-actions">
                          <button onClick={() => handleCompleteTask(task.id)} className="complete-btn">✅</button>
                          <button onClick={() => handleMoveToSomeday(task)} className="someday-btn">🗓️</button>
                          <button onClick={() => handleDeleteTask(task.id)} className="delete-task-btn">🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="task-group">
                <div className="task-group-header">
                  <span className="group-icon">✅</span>
                  <h3>Готово</h3>
                  <span className="task-count">{completedTasks.length}</span>
                </div>
                <div className="tasks-list">
                  {completedTasks.length === 0 ? (
                    <p className="empty-message">Нет выполненных задач</p>
                  ) : (
                    completedTasks.map(task => (
                      <div key={task.id} className="task-card completed">
                        <div className="task-time" style={{ borderColor: getEnergyColor(task.energy) }}>
                          {task.time}
                        </div>
                        <div className="task-content">
                          <span className="task-title">{task.title}</span>
                          <span className="task-energy">{getEnergyEmoji(task.energy)}</span>
                        </div>
                        <div className="task-actions">
                          <button onClick={() => handleUncompleteTask(task.id)} className="undo-btn">↩️</button>
                          <button onClick={() => handleDeleteTask(task.id, true)} className="delete-task-btn">🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'someday' && (
            <div className="someday-section">
              <div className="add-task-form">
                <input
                  type="text"
                  placeholder="Что хотите сделать когда-нибудь?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="task-title-input"
                />
                
                <div className="task-controls">
                  <div className="energy-selector-small">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        className={`energy-badge ${newTaskEnergy === level ? 'active' : ''}`}
                        onClick={() => setNewTaskEnergy(level)}
                      >
                        {getEnergyEmoji(level)}
                      </button>
                    ))}
                  </div>
                  
                  <button onClick={() => handleAddTask(true)} className="add-task-btn">+ Добавить</button>
                </div>
              </div>

              <div className="someday-list">
                {somedayTasks.length === 0 ? (
                  <p className="empty-message-large">
                    🗓️ Перетащите задачу из "В процессе" сюда<br />
                    Или добавьте новую задачу, которую планируете "когда-нибудь"
                  </p>
                ) : (
                  somedayTasks.map(task => (
                    <div
                      key={task.id}
                      className="someday-card"
                      draggable
                      onDragStart={() => handleDragStart(task, true)}
                    >
                      <div className="someday-content">
                        <span className="someday-title">{task.title}</span>
                        <span className="task-energy">{getEnergyEmoji(task.energy)}</span>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id, false, true)} className="delete-task-btn">🗑️</button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="drag-hint">
                💡 Подсказка: Перетащите задачу из "Когда-нибудь" на время в разделе "Раскидать по времени"
              </div>
            </div>
          )}

          {activeTab === 'success' && (
            <div className="notes-section">
              <div className="add-note-form">
                <textarea
                  placeholder="Чем я горжусь сегодня?"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="note-input"
                  rows={3}
                />
                <button onClick={handleAddEntry} className="add-note-btn success-btn">✨ Записать успех</button>
              </div>
              <div className="notes-list">
                {successes.map((success, index) => (
                  <div key={index} className="note-card success">
                    <div className="note-icon">🌟</div>
                    <div className="note-text">{success}</div>
                    <button onClick={() => handleDeleteEntry(index, 'success')} className="delete-note-btn">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'thoughts' && (
            <div className="notes-section">
              <div className="add-note-form">
                <textarea
                  placeholder="О чём я думаю?"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="note-input"
                  rows={3}
                />
                <button onClick={handleAddEntry} className="add-note-btn thought-btn">💭 Записать мысль</button>
              </div>
              <div className="notes-list">
                {thoughts.map((thought, index) => (
                  <div key={index} className="note-card thought">
                    <div className="note-icon">💭</div>
                    <div className="note-text">{thought}</div>
                    <button onClick={() => handleDeleteEntry(index, 'thoughts')} className="delete-note-btn">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer">
          <button onClick={saveData} className="save-btn">💾 Сохранить и закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default DailyEditor;
