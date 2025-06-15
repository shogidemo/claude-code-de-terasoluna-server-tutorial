import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeString,
  validateAndSanitizeTodoTitle,
  detectXSSPatterns,
  comprehensiveInputValidation,
  sanitizeFormData,
} from '../sanitizer';

describe('Sanitizer Utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
      expect(escapeHtml("It's a test")).toBe('It&#x27;s a test');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should not modify safe strings', () => {
      const safeString = 'Hello World 123';
      expect(escapeHtml(safeString)).toBe(safeString);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and escape strings', () => {
      expect(sanitizeString('  <script>  ')).toBe('&lt;script&gt;');
      expect(sanitizeString('   normal text   ')).toBe('normal text');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeString(123 as any)).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('validateAndSanitizeTodoTitle', () => {
    it('should validate correct titles', () => {
      const result = validateAndSanitizeTodoTitle('Valid TODO title');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedTitle).toBe('Valid TODO title');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty titles', () => {
      const result = validateAndSanitizeTodoTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TODOタイトルは必須です。');
    });

    it('should reject whitespace-only titles', () => {
      const result = validateAndSanitizeTodoTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TODOタイトルは空白文字のみにはできません。');
    });

    it('should reject too long titles', () => {
      const longTitle = 'a'.repeat(31);
      const result = validateAndSanitizeTodoTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TODOタイトルは30文字以内で入力してください。');
    });

    it('should reject non-string inputs', () => {
      const result = validateAndSanitizeTodoTitle(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TODOタイトルは文字列である必要があります。');
    });

    it('should detect SQL injection patterns', () => {
      const maliciousInputs = [
        'SELECT * FROM users',
        "TODO OR '1'='1'",
        'TODO; DROP TABLE todos;',
        'TODO /* comment */',
        'TODO -- comment',
      ];

      maliciousInputs.forEach(input => {
        const result = validateAndSanitizeTodoTitle(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('TODOタイトルに不正な文字列が含まれています。');
      });
    });

    it('should detect forbidden characters', () => {
      const result = validateAndSanitizeTodoTitle('TODO <script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TODOタイトルに使用できない文字が含まれています。');
    });
  });

  describe('detectXSSPatterns', () => {
    it('should detect script tags', () => {
      expect(detectXSSPatterns('<script>alert("xss")</script>')).toBe(true);
      expect(detectXSSPatterns('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true);
    });

    it('should detect javascript URLs', () => {
      expect(detectXSSPatterns('javascript:alert("xss")')).toBe(true);
      expect(detectXSSPatterns('JAVASCRIPT:alert("xss")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(detectXSSPatterns('onload=alert("xss")')).toBe(true);
      expect(detectXSSPatterns('onclick=alert("xss")')).toBe(true);
    });

    it('should detect dangerous tags', () => {
      expect(detectXSSPatterns('<iframe src="evil.com">')).toBe(true);
      expect(detectXSSPatterns('<object data="evil.swf">')).toBe(true);
      expect(detectXSSPatterns('<embed src="evil.swf">')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(detectXSSPatterns('Normal text content')).toBe(false);
      expect(detectXSSPatterns('Email: user@example.com')).toBe(false);
    });
  });

  describe('comprehensiveInputValidation', () => {
    it('should validate normal input', () => {
      const result = comprehensiveInputValidation('Normal input', 50);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Normal input');
      expect(result.errors).toHaveLength(0);
      expect(result.securityWarnings).toHaveLength(0);
    });

    it('should detect XSS patterns', () => {
      const result = comprehensiveInputValidation('<script>alert("xss")</script>', 50);
      expect(result.isValid).toBe(false);
      expect(result.securityWarnings).toContain('XSS攻撃パターンが検出されました。');
      expect(result.errors).toContain('不正な文字列が含まれています。');
    });

    it('should handle non-string inputs', () => {
      const result = comprehensiveInputValidation(123, 50);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('入力値は文字列である必要があります。');
    });

    it('should enforce length limits', () => {
      const result = comprehensiveInputValidation('a'.repeat(51), 50);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('入力は50文字以内で入力してください。');
    });

    it('should handle empty input', () => {
      const result = comprehensiveInputValidation('', 50);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('入力は必須です。');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize string values in form data', () => {
      const formData = {
        title: '  <script>alert("xss")</script>  ',
        description: '  normal text  ',
        count: 123,
        isActive: true,
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized.title).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitized.description).toBe('normal text');
      expect(sanitized.count).toBe(123);
      expect(sanitized.isActive).toBe(true);
    });

    it('should handle empty form data', () => {
      const result = sanitizeFormData({});
      expect(result).toEqual({});
    });

    it('should not modify original object', () => {
      const original = { title: '  test  ' };
      const sanitized = sanitizeFormData(original);
      
      expect(original.title).toBe('  test  ');
      expect(sanitized.title).toBe('test');
    });
  });
});