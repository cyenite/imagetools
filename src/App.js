import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';

// Page Components
import Home from './components/pages/Home';
import Pricing from './components/pages/Pricing';

// Category Pages
import ConversionTools from './components/categories/conversion/ConversionTools';
import ResizeTools from './components/categories/resize/ResizeTools';

// Conversion Tools
import HeicConverter from './components/categories/conversion/HeicConverter';
import ImageToPdf from './components/categories/conversion/ImageToPdf';
import SvgToRaster from './components/categories/conversion/SvgToRaster';
import FormatConverter from './components/categories/conversion/FormatConverter';

// Resize Tools
import GridCropper from './components/categories/resize/GridCropper';
import ImageCompressor from './components/categories/resize/ImageCompressor';
import BatchResizer from './components/categories/resize/BatchResizer';
import CircleCropper from './components/categories/resize/CircleCropper';
import AspectRatioCalculator from './components/categories/resize/AspectRatioCalculator';


function AppContent() {

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Conversion Tools Routes */}
          <Route path="/categories/conversion" element={<ConversionTools />} />
          <Route path="/categories/conversion/heic-converter" element={<HeicConverter />} />
          <Route path="/categories/conversion/format-converter" element={<FormatConverter />} />
          <Route path="/categories/conversion/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/categories/conversion/svg-to-raster" element={<SvgToRaster />} />

          {/* Resizing Tools Routes */}
          <Route path="/categories/resize" element={<ResizeTools />} />
          <Route path="/categories/resize/photo-cropper" element={<GridCropper />} />
          <Route path="/categories/resize/image-compressor" element={<ImageCompressor />} />
          <Route path="/categories/resize/batch-resize" element={<BatchResizer />} />
          <Route path="/categories/resize/crop-circle" element={<CircleCropper />} />
          <Route path="/categories/resize/aspect-ratio" element={<AspectRatioCalculator />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
