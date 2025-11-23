import { useRef, useState, useEffect } from 'react';
import { 
  Bot, Rocket, Cat, Skull, 
  Hammer, RefreshCw, Play, Pause, Save, 
  Download, FolderOpen, Menu, X 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateRobot } from '../generators/robotGenerator';
import { generateSpaceship } from '../generators/spaceshipGenerator';
import { generateAnimal } from '../generators/animalGenerator';
import { generateMonster } from '../generators/monsterGenerator';
import type { GeneratorCategory, VoxelObjectData } from '../types';
import { saveBlueprint, getSavedBlueprints, exportBlueprint, importBlueprint } from '../utils/storage';

const CATEGORIES: { id: GeneratorCategory; icon: any; label: string }[] = [
  { id: 'robot', icon: Bot, label: 'Robots' },
  { id: 'spaceship', icon: Rocket, label: 'Ships' },
  { id: 'animal', icon: Cat, label: 'Animals' },
  { id: 'monster', icon: Skull, label: 'Monsters' },
];

export function ControlPanel() {
  const { 
    currentObject, setCurrentObject, 
    isAutoRotating, toggleAutoRotation,
    setScrapped, isScrapped
  } = useAppStore();
  
  const [activeCategory, setActiveCategory] = useState<GeneratorCategory>('robot');
  const [isOpen, setIsOpen] = useState(true);
  const [savedItems, setSavedItems] = useState<VoxelObjectData[]>([]);
  const [presets, setPresets] = useState<VoxelObjectData[]>([]);
  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate initial object and presets
  useEffect(() => {
    handleGenerate();
    setSavedItems(getSavedBlueprints());
    
    // Generate presets
    const presetItems = [
       { ...generateRobot(), name: 'Mech Alpha' },
       { ...generateRobot(), name: 'Scout Bot' },
       { ...generateSpaceship(), name: 'Star Fighter' },
       { ...generateSpaceship(), name: 'Cargo Hauler' },
       { ...generateAnimal(), name: 'Cyber Wolf' },
       { ...generateMonster(), name: 'Slime Blob' },
    ];
    setPresets(presetItems);
  }, []);

  const handleGenerate = () => {
    switch (activeCategory) {
      case 'robot':
        setCurrentObject(generateRobot());
        break;
      case 'spaceship':
        setCurrentObject(generateSpaceship());
        break;
      case 'animal':
        setCurrentObject(generateAnimal());
        break;
      case 'monster':
        setCurrentObject(generateMonster());
        break;
      default:
        setCurrentObject(generateRobot());
    }
  };

  const handleScrap = (mode: 'explode' | 'crumble') => {
     if (currentObject && !isScrapped) {
       setScrapped(true, mode);
     }
  };
  
  const handleSave = () => {
    if (currentObject) {
      saveBlueprint(currentObject);
      setSavedItems(getSavedBlueprints());
    }
  };
  
  const handleLoad = (item: VoxelObjectData) => {
      setCurrentObject(item);
      // Infer category from item to update UI selection
      setActiveCategory(item.category);
  };
  
  const handleExport = () => {
    if (currentObject) exportBlueprint(currentObject);
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const data = await importBlueprint(file);
              setCurrentObject(data);
              setActiveCategory(data.category);
          } catch (err) {
              console.error("Failed to import", err);
              alert("Invalid blueprint file");
          }
      }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange}
      />

      {/* Mobile Toggle */}
      <button 
        className="fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-full md:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed top-0 left-0 h-full bg-gray-900/95 text-white 
        transition-transform duration-300 z-40
        w-full md:w-80 p-6 flex flex-col gap-6 border-r border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Voxel Forge
          </h1>
          <p className="text-xs text-gray-400">Procedural Generator v1.0</p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl transition-all border
                ${activeCategory === cat.id 
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600'}
              `}
            >
              <div className={`${activeCategory === cat.id ? 'text-white' : 'text-current'}`}>
                 <cat.icon size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4 mt-4">
           <button 
             onClick={handleGenerate}
             className="col-span-2 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 mb-2"
           >
             <RefreshCw size={20} />
             <span className="font-bold uppercase">GENERATE</span>
           </button>

           <button 
             onClick={() => handleScrap('crumble')}
             className="flex flex-col items-center justify-center gap-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-3 rounded-xl border border-orange-500/50 transition-all active:scale-95"
             disabled={isScrapped}
            >
             <Hammer size={18} />
             <span className="text-xs font-bold">CRUMBLE</span>
           </button>

           <button 
             onClick={() => handleScrap('explode')}
             className="flex flex-col items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-3 rounded-xl border border-red-500/50 transition-all active:scale-95"
             disabled={isScrapped}
            >
             <Rocket size={18} />
             <span className="text-xs font-bold">EXPLODE</span>
           </button>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 bg-gray-800 p-2 rounded-lg mt-auto">
          <button 
            onClick={toggleAutoRotation}
            className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            {isAutoRotating ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-sm">{isAutoRotating ? 'Pause' : 'Rotate'}</span>
          </button>
        </div>

        {/* Storage */}
        <div className="grid grid-cols-2 gap-2">
           <button 
             onClick={handleSave}
             className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
             title="Save to Local Storage"
            >
             <Save size={16} /> Save
           </button>
           <button 
             onClick={handleExport}
             className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
             title="Download JSON"
            >
             <Download size={16} /> Export
           </button>
             <button 
             onClick={handleImportClick}
             className="col-span-2 flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
             title="Load JSON"
            >
             <FolderOpen size={16} /> Import File
           </button>
        </div>

        {/* Saved Items & Presets */}
        <div className="flex-1 flex flex-col mt-4 border-t border-gray-700 pt-4 min-h-0">
            <div className="flex gap-4 mb-2">
               <button 
                  onClick={() => setActiveTab('presets')}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 transition-colors ${activeTab === 'presets' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 Presets
               </button>
               <button 
                  onClick={() => setActiveTab('saved')}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 transition-colors ${activeTab === 'saved' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 My Blueprints
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-2">
                    {(activeTab === 'presets' ? presets : savedItems).map((item, idx) => (
                        <button 
                            key={item.id + idx}
                            onClick={() => handleLoad(item)}
                            className="flex items-center justify-between text-left p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm border border-gray-700 hover:border-gray-500 group"
                        >
                            <div>
                                <div className="font-medium text-gray-300 group-hover:text-white">{item.name}</div>
                                <div className="text-[10px] text-gray-500 capitalize">{item.category}</div>
                            </div>
                            <Play size={14} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                        </button>
                    ))}
                    {activeTab === 'saved' && savedItems.length === 0 && (
                        <div className="text-center text-gray-500 text-xs py-4 italic">No saved blueprints yet.</div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </>
  );
}
