/**
 * Mobile Optimizer Component
 * Enhances mobile experience for virtual agents system
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone, Tablet, Monitor, RotateCcw, Maximize2,
  Minimize2, Settings, Eye, EyeOff, Zap
} from 'lucide-react';

interface MobileOptimization {
  touchOptimization: boolean;
  responsiveText: boolean;
  gestureSupport: boolean;
  orientationLock: boolean;
  performanceMode: boolean;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenSize: { width: number; height: number };
  touchSupport: boolean;
  connectionType: string;
}

const MobileOptimizer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'landscape',
    screenSize: { width: 0, height: 0 },
    touchSupport: false,
    connectionType: 'unknown'
  });
  const [optimization, setOptimization] = useState<MobileOptimization>({
    touchOptimization: true,
    responsiveText: true,
    gestureSupport: true,
    orientationLock: false,
    performanceMode: false
  });

  // Detect device information
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: DeviceInfo['type'] = 'desktop';
      if (width <= 768) deviceType = 'mobile';
      else if (width <= 1024) deviceType = 'tablet';

      const orientation = width > height ? 'landscape' : 'portrait';
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Get connection info
      let connectionType = 'unknown';
      if ('connection' in navigator) {
        const connection = (navigator as unknown).connection;
        connectionType = connection.effectiveType || connection.type || 'unknown';
      }

      setDeviceInfo({
        type: deviceType,
        orientation,
        screenSize: { width, height },
        touchSupport,
        connectionType
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Apply mobile optimizations
  useEffect(() => {
    const applyOptimizations = () => {
      const root = document.documentElement;

      // Touch optimization
      if (optimization.touchOptimization && deviceInfo.touchSupport) {
        root.style.setProperty('--touch-target-size', '44px');
        document.body.classList.add('touch-optimized');
      } else {
        root.style.removeProperty('--touch-target-size');
        document.body.classList.remove('touch-optimized');
      }

      // Responsive text
      if (optimization.responsiveText) {
        const baseFontSize = deviceInfo.type === 'mobile' ? 14 : 16;
        root.style.setProperty('--base-font-size', `${baseFontSize}px`);
        document.body.classList.add('responsive-text');
      } else {
        root.style.removeProperty('--base-font-size');
        document.body.classList.remove('responsive-text');
      }

      // Performance mode
      if (optimization.performanceMode) {
        document.body.classList.add('performance-mode');
        // Disable animations on low-end devices
        if (deviceInfo.connectionType === 'slow-2g' || deviceInfo.connectionType === '2g') {
          document.body.classList.add('reduced-motion');
        }
      } else {
        document.body.classList.remove('performance-mode');
        document.body.classList.remove('reduced-motion');
      }
    };

    applyOptimizations();
  }, [optimization, deviceInfo]);

  // Add gesture support
  useEffect(() => {
    if (!optimization.gestureSupport || !deviceInfo.touchSupport) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Detect swipe gestures
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) {
          const direction = diffX > 0 ? 'left' : 'right';
          document.dispatchEvent(new CustomEvent('swipe', { detail: { direction } }));
        }
      } else {
        if (Math.abs(diffY) > 50) {
          const direction = diffY > 0 ? 'up' : 'down';
          document.dispatchEvent(new CustomEvent('swipe', { detail: { direction } }));
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [optimization.gestureSupport, deviceInfo.touchSupport]);

  // Handle orientation lock
  const handleOrientationLock = async () => {
    if (!('screen' in window) || !('orientation' in window.screen)) return;

    try {
      const screen = window.screen as unknown;
      if (optimization.orientationLock) {
        await screen.orientation.lock('portrait');
      } else {
        screen.orientation.unlock();
      }
    } catch (error) {
      console.warn('Orientation lock not supported:', error);
    }
  };

  useEffect(() => {
    handleOrientationLock();
  }, [optimization.orientationLock]);

  // Auto-show on mobile devices
  useEffect(() => {
    if (deviceInfo.type === 'mobile' && !localStorage.getItem('mobile-optimizer-dismissed')) {
      setIsVisible(true);
    }
  }, [deviceInfo.type]);

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        title="Mobile Optimizer"
      >
        <Smartphone className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DeviceIcon className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold">Mobile Optimizer</h2>
                <p className="text-purple-100 text-sm">Enhance your mobile experience</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                localStorage.setItem('mobile-optimizer-dismissed', 'true');
              }}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Device Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Device Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="ml-2 font-medium capitalize">{deviceInfo.type}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Orientation:</span>
              <span className="ml-2 font-medium capitalize">{deviceInfo.orientation}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Screen:</span>
              <span className="ml-2 font-medium">
                {deviceInfo.screenSize.width}×{deviceInfo.screenSize.height}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Touch:</span>
              <span className="ml-2 font-medium">
                {deviceInfo.touchSupport ? 'Supported' : 'Not supported'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">Connection:</span>
              <span className="ml-2 font-medium capitalize">
                {deviceInfo.connectionType.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Settings */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Optimization Settings</h3>
          <div className="space-y-4">
            {/* Touch Optimization */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Touch Optimization</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Larger touch targets</div>
                </div>
              </div>
              <button
                onClick={() => setOptimization(prev => ({ 
                  ...prev, 
                  touchOptimization: !prev.touchOptimization 
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  optimization.touchOptimization 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  optimization.touchOptimization ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Responsive Text */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Responsive Text</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Optimized font sizes</div>
                </div>
              </div>
              <button
                onClick={() => setOptimization(prev => ({ 
                  ...prev, 
                  responsiveText: !prev.responsiveText 
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  optimization.responsiveText 
                    ? 'bg-green-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  optimization.responsiveText ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Gesture Support */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Gesture Support</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Swipe gestures</div>
                </div>
              </div>
              <button
                onClick={() => setOptimization(prev => ({ 
                  ...prev, 
                  gestureSupport: !prev.gestureSupport 
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  optimization.gestureSupport 
                    ? 'bg-purple-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                disabled={!deviceInfo.touchSupport}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  optimization.gestureSupport ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Performance Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Performance Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reduced animations</div>
                </div>
              </div>
              <button
                onClick={() => setOptimization(prev => ({ 
                  ...prev, 
                  performanceMode: !prev.performanceMode 
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  optimization.performanceMode 
                    ? 'bg-yellow-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  optimization.performanceMode ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Recommendations */}
          {deviceInfo.type === 'mobile' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Mobile Recommendations
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Enable touch optimization for better interaction</li>
                <li>• Use responsive text for better readability</li>
                {deviceInfo.connectionType.includes('2g') && (
                  <li>• Enable performance mode for slower connections</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button
            onClick={() => setIsVisible(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizer;
