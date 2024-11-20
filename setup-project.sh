#!/bin/bash

# Create main directory structure
mkdir -p src/components/{layout,pages,conversion,resize,compression}
mkdir -p src/utils

# Create layout components
cat > src/components/layout/Navbar.js << 'EOL'
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ImageTools.xyz</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/convert">Convert</Link>
        <Link to="/resize">Resize</Link>
        <Link to="/compress">Compress</Link>
      </div>
    </nav>
  );
};

export default Navbar;
EOL

# Create conversion tools
touch src/components/conversion/{ImageFormatConverter,HeicConverter,PdfConverter,SvgConverter}.js

# Create resize tools
touch src/components/resize/{ImageResizer,PhotoCropper,BatchResizer,CircleCropper}.js

# Create compression tools
touch src/components/compression/{ImageCompressor,ImageOptimizer,QualityAnalyzer}.js

# Create utility files
cat > src/utils/imageProcessing.js << 'EOL'
import { saveAs } from 'file-saver';

export const convertImage = async (file, format) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, `image/${format}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const resizeImage = async (file, width, height, maintainAspectRatio = true) => {
  // Implementation for image resizing
};

export const compressImage = async (file, quality) => {
  // Implementation for image compression
};
EOL

cat > src/utils/fileHandling.js << 'EOL'
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
  return validTypes.includes(file.type);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
EOL

# Create Home page
cat > src/components/pages/Home.js << 'EOL'
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to ImageTools.xyz</h1>
      <div className="tool-grid">
        <div className="tool-card">
          <h2>Image Conversion</h2>
          <Link to="/convert">Convert images between formats</Link>
        </div>
        <div className="tool-card">
          <h2>Image Resizing</h2>
          <Link to="/resize">Resize and crop images</Link>
        </div>
        <div className="tool-card">
          <h2>Image Compression</h2>
          <Link to="/compress">Optimize and compress images</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
EOL

# Create Navbar styles
cat > src/components/layout/Navbar.css << 'EOL'
.navbar {
  background-color: var(--primary-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  margin-left: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.navbar-menu a:hover {
  background-color: var(--secondary-color);
}
EOL

# Make the script executable
chmod +x setup-project.sh

echo "Project structure created successfully!"