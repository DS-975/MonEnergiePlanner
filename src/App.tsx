import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EditTaskModal from './components/EditTaskModal';
import './theme.css';

interface Task {
  id: string;
  title: string;
  time: string;
  energy: number;
  completed: boolean;
}

type Theme = 'dark' | 'light';

function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingDate, setEditingDate] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskEnergy, setNewTaskEnergy] = useState(3);
  const [events, setEvents] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState<'day' | 'week' | 'month'>('day');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app_theme') as Theme) || 'dark';
  });
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && calendarRef.current) {
        calendarRef.current.getApi().changeView('timeGridDay');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getEnergyEmoji = (energy: number) => {
    if (energy === 1) return '🪫';
    if (energy === 2) return '🔋';
    if (energy === 3) return '⚡';
    if (energy === 4) return '💪';
    return '🔥';
  };

  const loadTasks = () => {
    const allEvents: any[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('planner_')) {
        const date = key.replace('planner_', '');
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (data.tasks && Array.isArray(data.tasks)) {
          data.tasks.forEach((task: Task) => {
            if (task.time && task.time !== '—') {
              const [hours, minutes] = task.time.split(':');
              const startDate = new Date(date);
              startDate.setHours(parseInt(hours), parseInt(minutes), 0);
              
              const endDate = new Date(startDate);
              endDate.setMinutes(endDate.getMinutes() + 60);
              
              allEvents.push({
                id: task.id,
                title: `${getEnergyEmoji(task.energy)} ${task.title}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                backgroundColor: task.completed ? '#22c55e' : '#3b82f6',
                borderColor: task.completed ? '#22c55e' : '#3b82f6',
                textColor: 'white',
                extendedProps: { task, date }
              });
            }
          });
        }
      }
    }
    
    return allEvents;
  };

  const refreshCalendar = () => {
    const newEvents = loadTasks();
    setEvents(newEvents);
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  useEffect(() => {
    refreshCalendar();
    
    const handleUpdate = () => refreshCalendar();
    window.addEventListener('tasks-updated', handleUpdate);
    return () => window.removeEventListener('tasks-updated', handleUpdate);
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setNewTaskTitle('');
    setNewTaskTime('09:00');
    setNewTaskEnergy(3);
    setShowAddForm(true);
  };

  const handleSelectSlot = (info: any) => {
    const date = info.start.toISOString().split('T')[0];
    const time = info.start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setSelectedDate(date);
    setNewTaskTime(time);
    setNewTaskTitle('');
    setNewTaskEnergy(3);
    setShowAddForm(true);
  };

  const handleEventClick = (info: any) => {
    const task = info.event.extendedProps?.task;
    const date = info.event.extendedProps?.date;
    if (task && date) {
      setEditingTask(task);
      setEditingDate(date);
      setShowEditForm(true);
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      alert('Введите название задачи');
      return;
    }
    
    const saved = localStorage.getItem(`planner_${selectedDate}`);
    const data = saved ? JSON.parse(saved) : { tasks: [] };
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      time: newTaskTime,
      energy: newTaskEnergy,
      completed: false
    };
    
    data.tasks = [newTask, ...(data.tasks || [])];
    localStorage.setItem(`planner_${selectedDate}`, JSON.stringify(data));
    
    setShowAddForm(false);
    refreshCalendar();
  };

  const handleEventDrop = (info: any) => {
    const taskId = info.event.id;
    const newDate = info.event.start.toISOString().split('T')[0];
    const newTime = info.event.start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const oldDate = info.event.extendedProps?.date;
    
    const oldData = JSON.parse(localStorage.getItem(`planner_${oldDate}`) || '{"tasks":[]}');
    const task = oldData.tasks.find((t: Task) => t.id === taskId);
    
    if (task) {
      oldData.tasks = oldData.tasks.filter((t: Task) => t.id !== taskId);
      localStorage.setItem(`planner_${oldDate}`, JSON.stringify(oldData));
      
      const newData = JSON.parse(localStorage.getItem(`planner_${newDate}`) || '{"tasks":[]}');
      task.time = newTime;
      newData.tasks = [task, ...newData.tasks];
      localStorage.setItem(`planner_${newDate}`, JSON.stringify(newData));
      
      refreshCalendar();
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayData = JSON.parse(localStorage.getItem(`planner_${today}`) || '{"tasks":[]}');
  const todayTasks = todayData.tasks || [];

  const changeMobileView = (view: 'day' | 'week' | 'month') => {
    setMobileView(view);
    if (calendarRef.current) {
      const viewMap = { day: 'timeGridDay', week: 'timeGridWeek', month: 'dayGridMonth' };
      calendarRef.current.getApi().changeView(viewMap[view]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚡ MonÉnergie Planner</h1>
            <p className="subtitle">Кликните на задачу → редактировать | Нажмите на время → добавить</p>
          </div>
          <div className="theme-switch">
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Тёмная
            </button>
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Светлая
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="timeGridDay"
            editable={true}
            selectable={true}
            select={handleSelectSlot}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={events}
            eventDrop={handleEventDrop}
            locale="ru"
            firstDay={1}
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            allDaySlot={true}
            allDayText="Весь день"
            nowIndicator={true}
            buttonText={{
              today: 'Сегодня',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День'
            }}
            height="auto"
            eventDisplay="block"
            longPressDelay={500}
            eventLongPressDelay={500}
          />
        </div>

        {/* Боковая панель - ТОЛЬКО ДЛЯ КОМПЬЮТЕРА */}
        {!isMobile && (
          <div className="sidebar">
            <h2>📝 Задачи на сегодня</h2>
            <div className="today-date">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            
            {todayTasks.length === 0 ? (
              <p className="no-tasks">Нет задач. Нажмите на время в календаре</p>
            ) : (
              <ul className="tasks-list">
                {todayTasks.map((task: Task) => (
                  <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <span className="task-time">{task.time}</span>
                    <span className="task-title">{task.title}</span>
                    <span className="task-energy">{getEnergyEmoji(task.energy)}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="sidebar-tip">
              💡 <strong>Советы:</strong><br />
              • Клик на задачу → редактировать<br />
              • Перетащи задачу → изменить время/дату<br />
              • Нажми на время → быстрая задача
            </div>
          </div>
        )}
      </main>

      {/* Мобильная нижняя панель навигации - ТОЛЬКО ДЛЯ ТЕЛЕФОНА */}
      {isMobile && (
        <div className="mobile-nav">
          <button 
            className={`mobile-nav-btn ${mobileView === 'day' ? 'active' : ''}`}
            onClick={() => changeMobileView('day')}
          >
            📅 День
          </button>
          <button 
            className={`mobile-nav-btn ${mobileView === 'week' ? 'active' : ''}`}
            onClick={() => changeMobileView('week')}
          >
            📆 Неделя
          </button>
          <button 
            className={`mobile-nav-btn ${mobileView === 'month' ? 'active' : ''}`}
            onClick={() => changeMobileView('month')}
          >
            🗓️ Месяц
          </button>
          <button 
            className="mobile-nav-btn add-btn-nav"
            onClick={() => {
              setSelectedDate(today);
              setNewTaskTitle('');
              setNewTaskTime('09:00');
              setNewTaskEnergy(3);
              setShowAddForm(true);
            }}
          >
            ➕
          </button>
        </div>
      )}

      {/* Мобильная панель задач - ТОЛЬКО ДЛЯ ТЕЛЕФОНА */}
      {isMobile && todayTasks.length > 0 && (
        <div className="mobile-tasks-panel">
          <div className="mobile-tasks-header">
            <span>📝 Сегодня ({todayTasks.length})</span>
          </div>
          <div className="mobile-tasks-list">
            {todayTasks.slice(0, 3).map((task: Task) => (
              <div key={task.id} className={`mobile-task-item ${task.completed ? 'completed' : ''}`}>
                <span className="mobile-task-time">{task.time}</span>
                <span className="mobile-task-title">{task.title}</span>
                <span className="mobile-task-energy">{getEnergyEmoji(task.energy)}</span>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <div className="mobile-tasks-more">+ ещё {todayTasks.length - 3}</div>
            )}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Новая задача</h3>
              <button onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Что нужно сделать?"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                autoFocus
              />
              <div className="modal-row">
                <label>⏰ Время</label>
                <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} />
              </div>
              <div className="modal-row">
                <label>⚡ Энергия</label>
                <div className="energy-buttons">
                  {[1, 2, 3, 4, 5].map(e => (
                    <button
                      key={e}
                      className={`energy-btn ${newTaskEnergy === e ? 'active' : ''}`}
                      onClick={() => setNewTaskEnergy(e)}
                    >
                      {getEnergyEmoji(e)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={addTask} className="add-btn">➕ Добавить</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && editingTask && (
        <EditTaskModal
          task={editingTask}
          date={editingDate}
          onClose={() => setShowEditForm(false)}
          onSave={refreshCalendar}
        />
      )}
    </div>
  );
}

export default App;
