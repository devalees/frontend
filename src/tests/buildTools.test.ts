import { readConfigFile, readJsonFile } from './utils/testImplementationUtils';

describe('Build Tools', () => {
  describe('Build Process', () => {
    it('should have Next.js configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig).not.toBeNull();
    });

    it('should have build scripts in package.json', () => {
      const pkg = readConfigFile('package.json');
      expect(pkg.scripts).toEqual(expect.objectContaining({
        'build': 'next build',
        'dev': 'next dev',
        'start': 'next start'
      }));
    });

    it('should have proper build configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig).toBeDefined();
      expect(nextConfig.reactStrictMode).toBe(true);
    });
  });

  describe('Asset Handling', () => {
    it('should have proper asset handling configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig.images).toBeDefined();
      expect(nextConfig.images.domains).toBeDefined();
    });

    it('should have proper static file handling', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig.publicRuntimeConfig).toBeDefined();
    });
  });

  describe('Optimization', () => {
    it('should have proper code splitting configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig.experimental).toBeDefined();
    });

    it('should have proper minification configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig.swcMinify).toBe(true);
    });

    it('should have proper caching configuration', () => {
      const nextConfig = readConfigFile('next.config.js');
      expect(nextConfig.experimental?.turbotrace).toBeDefined();
    });
  });
}); 