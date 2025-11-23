import { useAppStore } from '../store/useAppStore';

export function exportImage() {
  const { setExporting } = useAppStore.getState();
  
  // Get the canvas element from the DOM
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // Hide floor grid and wait for render
  setExporting(true);
  
  // Wait for next frame to ensure everything is rendered (grid hidden)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        if (!dataURL || dataURL === 'data:,') {
          console.error('Failed to capture canvas - canvas may be empty');
          alert('Failed to export image. Please try again.');
          setExporting(false); // Restore grid
          return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `voxel-creation-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Restore grid after export
        setExporting(false);
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Failed to export image. Please try again.');
        setExporting(false); // Restore grid on error
      }
    });
  });
}
