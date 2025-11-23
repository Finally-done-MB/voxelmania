import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Save, Check } from 'lucide-react';
import { saveBlueprint, getSavedBlueprints } from '../utils/storage';

export function ObjectNameOverlay() {
  const currentObject = useAppStore((state) => state.currentObject);
  const isScrapped = useAppStore((state) => state.isScrapped);
  const updateCurrentObjectName = useAppStore((state) => state.updateCurrentObjectName);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [showSavedFeedback, setShowSavedFeedback] = useState(false);
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

    const handleClick = useCallback(() => {
      if (!isScrapped && currentObject?.name) {
        setEditValue(currentObject.name);
        setIsEditing(true);
      }
    }, [isScrapped, currentObject]);
    
    const refreshSavedItems = useAppStore((state) => state.refreshSavedItems);
    
    const handleSaveBlueprint = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentObject) {
        const beforeCount = getSavedBlueprints().length;
        saveBlueprint(currentObject);
        const afterCount = getSavedBlueprints().length;
        
        // Show feedback only if actually saved (not duplicate)
        if (afterCount > beforeCount) {
          // Update gallery immediately
          refreshSavedItems();
          setShowSavedFeedback(true);
          setTimeout(() => setShowSavedFeedback(false), 2000);
        }
      }
    }, [currentObject, refreshSavedItems]);

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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2">
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
              style={{ 
                minWidth: '100px',
                fontSize: '16px' // Prevent iOS auto-zoom (needs to be >=16px)
              }}
            />
          ) : (
            <div
              className="text-white text-sm font-medium text-center cursor-text hover:text-blue-300 transition-colors"
              onClick={handleClick}
              title="Tap to edit"
            >
              {displayName}
            </div>
          )}
        </div>
        
        {/* Save button - transparent with border, next to name */}
        {!isEditing && (
          <button
            onClick={handleSaveBlueprint}
            className={`p-2 rounded-lg border-2 transition-all active:scale-95 pointer-events-auto ${
              showSavedFeedback 
                ? 'bg-green-500/20 border-green-400' 
                : 'bg-transparent border-white/30 hover:border-green-400 hover:bg-green-500/10'
            }`}
            style={{ touchAction: 'manipulation' }}
            title="Save blueprint"
          >
            {showSavedFeedback ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Save size={18} className="text-white" />
            )}
          </button>
        )}
      </div>
    );
}

