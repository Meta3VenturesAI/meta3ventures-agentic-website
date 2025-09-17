import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  debounce,
  throttle,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
  parseQueryParams,
  buildQueryString,
  deepClone,
  isEmpty,
  formatNumber,
  formatFileSize,
  isValidEmail,
  isValidUrl,
  capitalize,
  camelToTitle,
  getInitials,
  groupBy,
  sortBy,
  unique,
  sleep,
  retry,
  memoize
} from '../helpers';

describe('Helper Functions', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');
      
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      
      throttledFn('first');
      throttledFn('second');
      throttledFn('third');
      
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');
      
      vi.advanceTimersByTime(100);
      
      throttledFn('fourth');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith('fourth');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('January 15, 2024');
    });
    
    it('should handle string dates', () => {
      expect(formatDate('2024-01-15')).toBe('January 15, 2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format time as "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });
    
    it('should format time in minutes', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });
    
    it('should format time in hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });
    
    it('should format time in days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncate(text, 20)).toBe('This is a very long...');
    });
    
    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncate(text, 20)).toBe('Short text');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('AI & Machine Learning')).toBe('ai-machine-learning');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('parseQueryParams', () => {
    it('should parse query string', () => {
      const params = parseQueryParams('?page=1&sort=date&filter=active');
      expect(params).toEqual({
        page: '1',
        sort: 'date',
        filter: 'active'
      });
    });
    
    it('should handle empty query string', () => {
      expect(parseQueryParams('')).toEqual({});
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const params = { page: 1, sort: 'date', filter: 'active' };
      expect(buildQueryString(params)).toBe('?page=1&sort=date&filter=active');
    });
    
    it('should handle empty object', () => {
      expect(buildQueryString({})).toBe('');
    });
    
    it('should skip null and undefined values', () => {
      const params = { page: 1, sort: null, filter: undefined, active: true };
      expect(buildQueryString(params)).toBe('?page=1&active=true');
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: [{ f: 5 }]
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.e[0]).not.toBe(original.e[0]);
    });
  });

  describe('isEmpty', () => {
    it('should check if value is empty', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(100)).toBe('100 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@company.co.uk')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.com')).toBe(true);
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
      expect(capitalize('')).toBe('');
    });
  });

  describe('camelToTitle', () => {
    it('should convert camelCase to Title Case', () => {
      expect(camelToTitle('camelCase')).toBe('Camel Case');
      expect(camelToTitle('someVariableName')).toBe('Some Variable Name');
      expect(camelToTitle('simple')).toBe('Simple');
    });
  });

  describe('getInitials', () => {
    it('should get initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
      expect(getInitials('Single')).toBe('S');
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const data = [
        { id: 1, category: 'A', value: 10 },
        { id: 2, category: 'B', value: 20 },
        { id: 3, category: 'A', value: 30 },
      ];
      
      const grouped = groupBy(data, 'category');
      
      expect(grouped).toEqual({
        A: [
          { id: 1, category: 'A', value: 10 },
          { id: 3, category: 'A', value: 30 },
        ],
        B: [
          { id: 2, category: 'B', value: 20 },
        ],
      });
    });
  });

  describe('sortBy', () => {
    it('should sort array by key', () => {
      const data = [
        { id: 3, name: 'Charlie' },
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      
      expect(sortBy(data, 'id')).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]);
      
      expect(sortBy(data, 'name', 'desc')).toEqual([
        { id: 3, name: 'Charlie' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' },
      ]);
    });
  });

  describe('unique', () => {
    it('should return unique values', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90);
    });
  });

  describe('retry', () => {
    it('should retry failed function', async () => {
      let attempts = 0;
      const fn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'Success';
      });
      
      const result = await retry(fn, 3, 10);
      
      expect(result).toBe('Success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
    
    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(retry(fn, 2, 10)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(fn);
      
      expect(memoizedFn(1, 2)).toBe(3);
      expect(memoizedFn(1, 2)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
      
      expect(memoizedFn(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});