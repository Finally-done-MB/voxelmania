import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function ObjectNameOverlay() {
  const currentObject = useAppStore((state) => state.currentObject);
  const isScrapped = useAppStore((state) => state.isScrapped);
  const updateCurrentObjectName = useAppStore((state) => state.updateCurrentObjectName);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Don't show overlay if no object, object is scrapped, or no name
    const shouldShow = currentObject && !isScrapped && currentObject?.name;
    
    // Reset editing state if object becomes invalid
    useEffect(() => {
      if (!shouldShow && isEditing) {
        setIsEditing(false);
      }
    }, [shouldShow, isEditing]);
    
    // Sync editValue when currentObject changes (but not when editing)
    useEffect(() => {
      if (!isEditing && currentObject?.name) {
        setEditValue(currentObject.name);
      }
    }, [currentObject?.name, isEditing]);

    const handleDoubleClick = useCallback(() => {
      if (!isScrapped && currentObject?.name) {
        setEditValue(currentObject.name);
        setIsEditing(true);
      }
    }, [isScrapped, currentObject]);

    const handleSave = useCallback(() => {
      if (editValue.trim() && updateCurrentObjectName) {
        updateCurrentObjectName(editValue.trim());
      }
      setIsEditing(false);
    }, [editValue, updateCurrentObjectName]);

    const handleCancel = useCallback(() => {
      if (currentObject?.name) {
        setEditValue(currentObject.name);
      }
      setIsEditing(false);
    }, [currentObject]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }, [handleSave, handleCancel]);

    // Focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    if (!shouldShow) {
      return null;
    }

    const displayName = currentObject?.name || '';

    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 shadow-lg pointer-events-auto">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-white text-sm font-medium text-center bg-transparent border-none outline-none w-full"
              style={{ minWidth: '100px' }}
            />
          ) : (
            <div
              className="text-white text-sm font-medium text-center cursor-text hover:text-blue-300 transition-colors"
              onDoubleClick={handleDoubleClick}
              title="Double-click to edit"
            >
              {displayName}
            </div>
          )}
        </div>
      </div>
    );
}

