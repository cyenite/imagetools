import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import Home from './components/pages/Home';
// Conversion tools
import HeicConverter from './components/categories/conversion/HeicConverter';
import ImageToPdf from './components/categories/conversion/ImageToPdf';
import PdfToImage from './components/categories/conversion/PdfToImage';
import ImageToSvg from './components/categories/conversion/ImageToSvg';
import SvgToRaster from './components/categories/conversion/SvgToRaster';
// Resize tools
import GridCropper from './components/categories/resize/GridCropper';
import ImageCompressor from './components/categories/resize/ImageCompressor';
import BatchResizer from './components/categories/resize/BatchResizer';
import CircleCropper from './components/categories/resize/CircleCropper';
import AspectRatioCalculator from './components/categories/resize/AspectRatioCalculator';
import Navbar from './components/layout/Navbar';
import Pricing from './components/pages/Pricing';

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Conversion Tools Routes */}
          <Route path="/categories/conversion/heic-converter" element={<HeicConverter />} />
          <Route path="/categories/conversion/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/categories/conversion/pdf-to-image" element={<PdfToImage />} />
          <Route path="/categories/conversion/image-to-svg" element={<ImageToSvg />} />
          <Route path="/categories/conversion/svg-to-raster" element={<SvgToRaster />} />

          {/* Resizing Tools Routes */}
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
