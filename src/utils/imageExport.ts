export function exportImage() {
  // Get the canvas element from the DOM
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // Wait for next frame to ensure everything is rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        if (!dataURL || dataURL === 'data:,') {
          console.error('Failed to capture canvas - canvas may be empty');
          alert('Failed to export image. Please try again.');
          return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `voxel-creation-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Failed to export image. Please try again.');
      }
    });
  });
}
