import { useState, useEffect } from 'react';
import './MobileMenu.css';

interface MobileMenuProps {
  onClose: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose, onClearAllData, onExportData, onImportData }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`mobile-menu-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className={`mobile-menu ${isVisible ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h3>⚡ Меню</h3>
          <button onClick={handleClose}>✕</button>
        </div>
        
        <div className="mobile-menu-items">
          <button onClick={() => { onExportData(); handleClose(); }}>
            📤 Экспорт данных
          </button>
          <button onClick={() => { onImportData(); handleClose(); }}>
            📥 Импорт данных
          </button>
          <button onClick={() => { onClearAllData(); handleClose(); }} className="danger">
            🗑️ Очистить всё
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
