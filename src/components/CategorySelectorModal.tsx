import { X, Bot, Rocket, Cat, Skull } from 'lucide-react';
import type { GeneratorCategory } from '../types';

const CATEGORIES: { id: GeneratorCategory; icon: any; label: string }[] = [
  { id: 'robot', icon: Bot, label: 'Robots' },
  { id: 'spaceship', icon: Rocket, label: 'Ships' },
  { id: 'animal', icon: Cat, label: 'Animals' },
  { id: 'monster', icon: Skull, label: 'Monsters' },
];

interface CategorySelectorModalProps {
  isOpen: boolean;
  activeCategory: GeneratorCategory;
  onSelect: (category: GeneratorCategory) => void;
  onClose: () => void;
}

export function CategorySelectorModal({ 
  isOpen, 
  activeCategory, 
  onSelect, 
  onClose 
}: CategorySelectorModalProps) {
  if (!isOpen) return null;

  const handleSelect = (category: GeneratorCategory) => {
    onSelect(category);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 bottom-20 z-[70] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Select Category</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2
                  ${isActive 
                    ? 'bg-blue-600/80 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-105' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600 active:scale-95'
                  }
                `}
              >
                <Icon 
                  size={32} 
                  className={isActive ? 'text-white' : 'text-current'}
                  strokeWidth={1.5} 
                />
                <span className="text-sm font-medium mt-2">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

