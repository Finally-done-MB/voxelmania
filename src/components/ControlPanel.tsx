import { useRef, useState, useEffect } from 'react';
import { 
  Bot, Rocket, Cat, Skull, 
  Hammer, RefreshCw, Play, Pause, Save, 
  Download, FolderOpen, Menu, X,
  Volume2, VolumeX, Trash2, Zap, Star, Image, BarChart3, Copy, Check, Edit2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateRobot } from '../generators/robotGenerator';
import { generateSpaceship } from '../generators/spaceshipGenerator';
import { generateAnimal } from '../generators/animalGenerator';
import { generateMonster } from '../generators/monsterGenerator';
import type { GeneratorCategory, VoxelObjectData } from '../types';
import { saveBlueprint, getSavedBlueprints, exportBlueprint, importBlueprint, deleteBlueprint, toggleFavorite, getFavoriteBlueprints } from '../utils/storage';
import { exportImage } from '../utils/imageExport';
import { getStats, trackCreation } from '../utils/stats';
import { 
  initAudio, resumeAudio, startAmbientMusic, setMusicVolume, setSfxVolume,
  playExplosionSound, playCrumbleSound 
} from '../utils/audio';

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // Tailwind's md breakpoint
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

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
    setScrapped, isScrapped,
    isMuted, toggleMute,
    isSfxMuted, toggleSfxMute
  } = useAppStore();
  
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<GeneratorCategory>('robot');
  // Start closed on mobile, open on desktop
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768; // md breakpoint
  });
  const [savedItems, setSavedItems] = useState<VoxelObjectData[]>([]);

  // Update menu state when screen size changes (e.g., device rotation from desktop to mobile)
  useEffect(() => {
    // Only auto-open on desktop if it was closed (user might have closed it on mobile)
    if (!isMobile && !isOpen) {
      setIsOpen(true);
    }
    // Don't auto-close on mobile - let user control it via the menu button
  }, [isMobile, isOpen]);
  const [activeTab, setActiveTab] = useState<'saved' | 'favorites' | 'stats'>('saved');
  const [seedInput, setSeedInput] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [seedSectionOpen, setSeedSectionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ambient music state (volume control)
  useEffect(() => {
    const audioCtx = (window as any).__audioCtx;
    if (!audioCtx) {
      // Audio not initialized yet - initialize it
      initAudio();
      startAmbientMusic();
      // Set initial volume based on mute state
      if (isMuted) {
        setMusicVolume(0);
      } else {
        setMusicVolume(0.5);
      }
      // Set initial SFX volume (always on by default)
      setSfxVolume(isSfxMuted ? 0 : 1);
      return;
    }
    
    if (isMuted) {
      // Mute: fade out volume (music keeps playing, just silent)
      setMusicVolume(0);
    } else {
      // Unmute: resume audio context and ensure music is playing
      resumeAudio().then(() => {
        // Make sure music is actually playing (start if not already)
        const audioCtx = (window as any).__audioCtx;
        if (audioCtx && audioCtx.state === 'running') {
          // Only start music if it's not already playing
          startAmbientMusic();
          // Fade in volume to 0.5
          setMusicVolume(0.5);
        } else {
          // If context isn't running yet, wait a bit and try again
          setTimeout(() => {
            startAmbientMusic();
            setMusicVolume(0.5);
          }, 100);
        }
      });
    }
  }, [isMuted]);

  // Handle SFX volume (independent of music)
  useEffect(() => {
    const audioCtx = (window as any).__audioCtx;
    if (!audioCtx) return; // Audio not initialized yet
    
    if (isSfxMuted) {
      // Mute SFX: fade out volume
      setSfxVolume(0);
    } else {
      // Unmute SFX: fade in volume to 1
      setSfxVolume(1);
    }
  }, [isSfxMuted]);

  // Generate initial object on mount and start muted music
  useEffect(() => {
    generateInitialObject();
    setSavedItems(getSavedBlueprints());
    // Initialize audio and start music (muted) - this works with autoplay policy
    initAudio();
    startAmbientMusic();
    // Set initial volume to 0 (muted) since isMuted defaults to true
    setMusicVolume(0);
  }, []);

  // Generate object without audio initialization (for initial load)
  const generateInitialObject = () => {
    let newObject: VoxelObjectData;
    switch (activeCategory) {
      case 'robot':
        newObject = generateRobot();
        break;
      case 'spaceship':
        newObject = generateSpaceship();
        break;
      case 'animal':
        newObject = generateAnimal();
        break;
      case 'monster':
        newObject = generateMonster();
        break;
      default:
        newObject = generateRobot();
    }
    setCurrentObject(newObject);
    trackCreation(newObject.category);
  };

  const handleGenerate = (seed?: number) => {
    resumeAudio(); // Ensure audio context is ready on user interaction
    let newObject: VoxelObjectData;
    switch (activeCategory) {
      case 'robot':
        newObject = generateRobot(seed);
        break;
      case 'spaceship':
        newObject = generateSpaceship(seed);
        break;
      case 'animal':
        newObject = generateAnimal(seed);
        break;
      case 'monster':
        newObject = generateMonster(seed);
        break;
      default:
        newObject = generateRobot(seed);
    }
    setCurrentObject(newObject);
    trackCreation(newObject.category);
  };

  const handleGenerateFromSeed = () => {
    const seed = parseInt(seedInput);
    if (!isNaN(seed) && seed > 0) {
      handleGenerate(seed);
      setSeedInput('');
    } else {
      alert('Please enter a valid seed number');
    }
  };

  const handleCopySeed = () => {
    if (currentObject?.seed) {
      navigator.clipboard.writeText(currentObject.seed.toString());
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
  };

  const handleEditName = (item: VoxelObjectData) => {
    setEditingName(item.id);
    setEditNameValue(item.name);
  };

  const handleSaveName = (itemId: string) => {
    const updated = savedItems.map(item => 
      item.id === itemId ? { ...item, name: editNameValue.trim() || item.name } : item
    );
    // Update in storage
    localStorage.setItem('voxel_forge_blueprints', JSON.stringify(updated));
    setSavedItems(updated);
    // Update current object if it's the one being edited
    if (currentObject?.id === itemId) {
      setCurrentObject({ ...currentObject, name: editNameValue.trim() || currentObject.name });
    }
    setEditingName(null);
    setEditNameValue('');
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setEditNameValue('');
  };

  const handleScrap = (mode: 'explode' | 'crumble') => {
     if (currentObject && !isScrapped) {
       // Ensure audio is initialized on user interaction (important for mobile)
       resumeAudio();
       if (!isSfxMuted) {
         // SFX functions handle their own audio context initialization
         if (mode === 'explode') playExplosionSound();
         else playCrumbleSound();
       }
       setScrapped(true, mode);
     }
  };
  
  const handleToggleMute = () => {
    // Ensure audio is initialized (should already be, but just in case)
    if (!(window as any).__audioCtx) {
      initAudio();
      startAmbientMusic();
    }
    // Resume audio context if suspended (needed for unmuting)
    resumeAudio();
    toggleMute();
  };

  const handleToggleSfxMute = () => {
    resumeAudio();
    toggleSfxMute();
  };

  const handleSave = () => {
    resumeAudio(); // Ensure audio context is ready on user interaction
    if (currentObject) {
      saveBlueprint(currentObject);
      setSavedItems(getSavedBlueprints());
    }
  };
  
  const handleLoad = (item: VoxelObjectData) => {
      resumeAudio(); // Ensure audio context is ready on user interaction
      setCurrentObject(item);
      // Infer category from item to update UI selection
      setActiveCategory(item.category);
      // If item has a seed, we could optionally regenerate from it, but for now just load as-is
  };
  
  const handleExport = () => {
    resumeAudio(); // Ensure audio context is ready on user interaction
    if (currentObject) exportBlueprint(currentObject);
  };
  
  const handleImportClick = () => {
      resumeAudio(); // Ensure audio context is ready on user interaction
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

  const handleDelete = (e: React.MouseEvent, blueprintId: string) => {
    e.stopPropagation(); // Prevent triggering the load action
    if (confirm('Are you sure you want to delete this blueprint?')) {
      deleteBlueprint(blueprintId);
      setSavedItems(getSavedBlueprints());
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, blueprintId: string) => {
    e.stopPropagation(); // Prevent triggering the load action
    toggleFavorite(blueprintId);
    setSavedItems(getSavedBlueprints());
  };

  const handleExportImage = () => {
    resumeAudio(); // Ensure audio context is ready on user interaction
    if (currentObject) {
      exportImage();
    }
  };

  const stats = getStats();
  const favoriteItems = getFavoriteBlueprints();
  const displayItems = activeTab === 'favorites' ? favoriteItems : savedItems;

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange}
      />

      {/* Floating Effect Buttons - Always visible on mobile when menu is closed */}
      {isMobile && !isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <button 
            onClick={() => handleScrap('explode')}
            className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full border border-red-500/50 transition-all active:scale-95 shadow-lg"
            disabled={isScrapped}
            title="Explode"
          >
            <Rocket size={24} />
          </button>
          <button 
            onClick={() => handleScrap('crumble')}
            className="p-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full border border-orange-500/50 transition-all active:scale-95 shadow-lg"
            disabled={isScrapped}
            title="Crumble"
          >
            <Hammer size={24} />
          </button>
        </div>
      )}

      {/* Mobile Toggle */}
      <button 
        className="fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-full md:hidden text-white shadow-lg"
            onClick={() => {
              setIsOpen(!isOpen);
              // Initialize audio on any user interaction
              resumeAudio();
            }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed top-0 left-0 h-full bg-gray-900/95 text-white 
        transition-transform duration-300 z-40
        w-full md:w-80 p-4 md:p-4 flex flex-col gap-3 md:gap-4 border-r border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="mb-2 md:mb-3">
          <h1 className="text-xl md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Voxel Forge
          </h1>
          <p className="text-xs text-gray-400">Procedural Generator v1.0</p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-4 gap-2 md:gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                // Initialize audio on any user interaction
                resumeAudio();
              }}
              className={`
                flex flex-col items-center justify-center p-2 md:p-2 rounded-xl transition-all border
                ${activeCategory === cat.id 
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600'}
              `}
            >
              <div className={`${activeCategory === cat.id ? 'text-white' : 'text-current'}`}>
                 <cat.icon size={20} className="md:w-5 md:h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] md:text-[10px] mt-0.5 font-medium tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Seed Display & Controls - Collapsible on mobile */}
        {currentObject?.seed && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <button
              onClick={() => setSeedSectionOpen(!seedSectionOpen)}
              className="w-full flex items-center justify-between p-2 md:p-2 text-left"
            >
              <span className="text-xs text-gray-400">Seed:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySeed();
                  }}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  title="Copy seed"
                >
                  {copiedSeed ? (
                    <>
                      <Check size={12} />
                      <span className="hidden md:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span className="font-mono hidden md:inline">{currentObject.seed}</span>
                      <span className="font-mono md:hidden text-[10px]">{currentObject.seed.toString().slice(-6)}</span>
                    </>
                  )}
                </button>
                <span className="text-gray-500 text-xs md:hidden">
                  {seedSectionOpen ? '−' : '+'}
                </span>
              </div>
            </button>
            <div className={`px-2 md:px-2 pb-2 md:pb-2 flex gap-2 ${seedSectionOpen ? 'flex' : 'hidden md:flex'}`}>
                <input
                  type="number"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="Enter seed..."
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleGenerateFromSeed}
                  className="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
                >
                  Load
                </button>
              </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-2 md:gap-2 mt-2 md:mt-3">
           <button 
             onClick={() => handleGenerate()}
             className="col-span-2 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white p-3 md:p-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 mb-1"
           >
             <RefreshCw size={18} className="md:w-4 md:h-4" />
             <span className="font-bold uppercase text-sm md:text-sm">GENERATE</span>
           </button>

           <button 
             onClick={() => handleScrap('crumble')}
             className="flex flex-col items-center justify-center gap-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-2 md:p-2 rounded-xl border border-orange-500/50 transition-all active:scale-95"
             disabled={isScrapped}
            >
             <Hammer size={16} className="md:w-4 md:h-4" />
             <span className="text-[10px] md:text-[10px] font-bold">CRUMBLE</span>
           </button>

           <button 
             onClick={() => handleScrap('explode')}
             className="flex flex-col items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 md:p-2 rounded-xl border border-red-500/50 transition-all active:scale-95"
             disabled={isScrapped}
            >
             <Rocket size={16} className="md:w-4 md:h-4" />
             <span className="text-[10px] md:text-[10px] font-bold">EXPLODE</span>
           </button>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-1 md:gap-1.5 bg-gray-800 p-1.5 md:p-1.5 rounded-lg mt-auto">
          <button 
            onClick={() => {
              // Initialize audio on any user interaction
              resumeAudio();
              toggleAutoRotation();
            }}
            className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-1.5 hover:bg-gray-700 rounded-md transition-colors"
          >
            {isAutoRotating ? <Pause size={16} className="md:w-4 md:h-4" /> : <Play size={16} className="md:w-4 md:h-4" />}
            <span className="text-xs md:text-xs">{isAutoRotating ? 'Pause' : 'Rotate'}</span>
          </button>
          
          <button 
            onClick={handleToggleMute}
            className={`p-1.5 md:p-1.5 rounded-md transition-colors ${isMuted ? 'text-gray-500 hover:bg-gray-700' : 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/50'}`}
            title={isMuted ? "Unmute Music" : "Mute Music"}
          >
            {isMuted ? <VolumeX size={16} className="md:w-4 md:h-4" /> : <Volume2 size={16} className="md:w-4 md:h-4" />}
          </button>
          
          <button 
            onClick={handleToggleSfxMute}
            className={`p-1.5 md:p-1.5 rounded-md transition-colors ${isSfxMuted ? 'text-gray-500 hover:bg-gray-700' : 'text-orange-400 bg-orange-900/30 hover:bg-orange-900/50'}`}
            title={isSfxMuted ? "Enable SFX" : "Disable SFX"}
          >
            {isSfxMuted ? <Zap size={16} className="md:w-4 md:h-4 opacity-50" /> : <Zap size={16} className="md:w-4 md:h-4" />}
          </button>
        </div>

        {/* Storage */}
        <div className="grid grid-cols-2 gap-1.5 md:gap-1.5">
           <button 
             onClick={handleSave}
             className="flex items-center justify-center gap-1 md:gap-1.5 p-2 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs md:text-xs"
             title="Save to Local Storage"
            >
             <Save size={14} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Save</span>
           </button>
           <button 
             onClick={handleExportImage}
             className="flex items-center justify-center gap-1 md:gap-1.5 p-2 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs md:text-xs"
             title="Export as Image"
            >
             <Image size={14} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Image</span>
           </button>
           <button 
             onClick={handleExport}
             className="flex items-center justify-center gap-1 md:gap-1.5 p-2 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs md:text-xs"
             title="Download JSON"
            >
             <Download size={14} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">JSON</span>
           </button>
           <button 
             onClick={handleImportClick}
             className="flex items-center justify-center gap-1 md:gap-1.5 p-2 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs md:text-xs"
             title="Load JSON"
            >
             <FolderOpen size={14} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Import</span>
           </button>
        </div>

        {/* Saved Items & Stats */}
        <div className="flex-1 flex flex-col mt-2 md:mt-3 border-t border-gray-700 pt-2 md:pt-3 min-h-0">
            <div className="flex gap-2 mb-2 flex-wrap">
               <button 
                  onClick={() => setActiveTab('saved')}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 transition-colors ${activeTab === 'saved' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 Gallery
               </button>
               <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 transition-colors ${activeTab === 'favorites' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 Favorites
               </button>
               <button 
                  onClick={() => setActiveTab('stats')}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 transition-colors ${activeTab === 'stats' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 <BarChart3 size={12} className="inline" />
               </button>
            </div>
            
            {activeTab === 'saved' ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-2">
                    {savedItems.map((item, idx) => (
                        <div
                            key={item.id + idx}
                            className="flex items-center gap-1 md:gap-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm border border-gray-700 hover:border-gray-500 group"
                        >
                            <button 
                                onClick={() => handleLoad(item)}
                                className="flex-1 flex items-center justify-between text-left p-2 md:p-2"
                            >
                                <div className="flex-1">
                                    {editingName === item.id ? (
                                      <input
                                        type="text"
                                        value={editNameValue}
                                        onChange={(e) => setEditNameValue(e.target.value)}
                                        onBlur={() => handleSaveName(item.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveName(item.id);
                                          if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        className="w-full px-1 py-0.5 bg-gray-700 border border-blue-500 rounded text-xs text-white focus:outline-none"
                                        autoFocus
                                      />
                                    ) : (
                                      <>
                                        <div className="font-medium text-gray-300 group-hover:text-white">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 capitalize">{item.category}</div>
                                        {item.seed && (
                                          <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                                            Seed: {item.seed}
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                                <Play size={14} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity ml-2" />
                            </button>
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resumeAudio();
                                  handleEditName(item);
                                }}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit name"
                            >
                                <Edit2 size={11} className="md:w-3 md:h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                  resumeAudio();
                                  handleToggleFavorite(e, item.id);
                                }}
                                className={`p-1.5 md:p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-md transition-colors ${
                                  item.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                }`}
                                title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star size={12} className={`md:w-3.5 md:h-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <button
                                onClick={(e) => {
                                  resumeAudio();
                                  handleDelete(e, item.id);
                                }}
                                className="p-1.5 md:p-2 mr-1 md:mr-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete blueprint"
                            >
                                <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                        </div>
                    ))}
                    {savedItems.length === 0 && (
                        <div className="text-center text-gray-500 text-xs py-4 italic">
                          No saved blueprints yet. Save some to see them here.
                        </div>
                    )}
                </div>
              </div>
            ) : activeTab === 'stats' ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-2 md:space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 border border-gray-700">
                    <h3 className="text-xs md:text-sm font-bold text-gray-300 mb-2 md:mb-3">Creation Stats</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Creations:</span>
                        <span className="text-white font-bold">{stats.totalCreations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Robots:</span>
                        <span className="text-white">{stats.byCategory.robot || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spaceships:</span>
                        <span className="text-white">{stats.byCategory.spaceship || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Animals:</span>
                        <span className="text-white">{stats.byCategory.animal || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monsters:</span>
                        <span className="text-white">{stats.byCategory.monster || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 border border-gray-700">
                    <h3 className="text-xs md:text-sm font-bold text-gray-300 mb-2 md:mb-3">Collection</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Saved Blueprints:</span>
                        <span className="text-white font-bold">{savedItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Favorites:</span>
                        <span className="text-white font-bold">{favoriteItems.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-2">
                    {displayItems.map((item, idx) => (
                        <div
                            key={item.id + idx}
                            className="flex items-center gap-1 md:gap-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm border border-gray-700 hover:border-gray-500 group"
                        >
                            <button 
                                onClick={() => handleLoad(item)}
                                className="flex-1 flex items-center justify-between text-left p-2 md:p-2"
                            >
                                <div className="flex-1">
                                    {editingName === item.id ? (
                                      <input
                                        type="text"
                                        value={editNameValue}
                                        onChange={(e) => setEditNameValue(e.target.value)}
                                        onBlur={() => handleSaveName(item.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveName(item.id);
                                          if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        className="w-full px-1 py-0.5 bg-gray-700 border border-blue-500 rounded text-xs text-white focus:outline-none"
                                        autoFocus
                                      />
                                    ) : (
                                      <>
                                        <div className="font-medium text-gray-300 group-hover:text-white">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 capitalize">{item.category}</div>
                                        {item.seed && (
                                          <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                                            Seed: {item.seed}
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                                <Play size={14} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity ml-2" />
                            </button>
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resumeAudio();
                                  handleEditName(item);
                                }}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit name"
                            >
                                <Edit2 size={11} className="md:w-3 md:h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                  resumeAudio();
                                  handleToggleFavorite(e, item.id);
                                }}
                                className={`p-1.5 md:p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-md transition-colors ${
                                  item.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                }`}
                                title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star size={12} className={`md:w-3.5 md:h-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <button
                                onClick={(e) => {
                                  resumeAudio();
                                  handleDelete(e, item.id);
                                }}
                                className="p-1.5 md:p-2 mr-1 md:mr-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete blueprint"
                            >
                                <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                        </div>
                    ))}
                    {displayItems.length === 0 && (
                        <div className="text-center text-gray-500 text-xs py-4 italic">
                          {activeTab === 'favorites' ? 'No favorites yet. Star a blueprint to add it here.' : 'No saved blueprints yet.'}
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>

      </div>
    </>
  );
}
