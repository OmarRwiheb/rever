// This is a helper script to generate placeholder images
// In a real application, you would have actual product images
// For now, we'll use a placeholder service

const generatePlaceholderImage = (width, height, text) => {
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/6b7280?text=${encodeURIComponent(text)}`;
};

// Example usage:
// generatePlaceholderImage(400, 600, "Dress 1")
// This would generate a placeholder image with the text "Dress 1"

export default generatePlaceholderImage; 