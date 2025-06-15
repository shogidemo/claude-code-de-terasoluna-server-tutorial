// HTML エスケープマップ
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * HTMLエスケープ関数
 * @param text エスケープ対象の文字列
 * @returns エスケープされた文字列
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match);
}

/**
 * 文字列をサニタイズ（トリム + HTMLエスケープ）
 * @param input サニタイズ対象の文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return escapeHtml(input.trim());
}

/**
 * TODOタイトルの検証とサニタイズ
 * @param title TODOタイトル
 * @returns 検証結果とサニタイズされたタイトル
 */
export function validateAndSanitizeTodoTitle(title: unknown): {
  isValid: boolean;
  sanitizedTitle: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 型チェック
  if (typeof title !== 'string') {
    return {
      isValid: false,
      sanitizedTitle: '',
      errors: ['TODOタイトルは文字列である必要があります。'],
    };
  }
  
  // 基本的なサニタイゼーション
  const sanitized = sanitizeString(title);
  
  // 長さチェック
  if (sanitized.length === 0) {
    errors.push('TODOタイトルは必須です。');
  } else if (sanitized.length > 30) {
    errors.push('TODOタイトルは30文字以内で入力してください。');
  } else if (sanitized.length < 1) {
    errors.push('TODOタイトルは1文字以上で入力してください。');
  }
  
  // 禁止文字チェック
  const forbiddenChars = /[<>\"'&]/;
  if (forbiddenChars.test(title)) {
    errors.push('TODOタイトルに使用できない文字が含まれています。');
  }
  
  // 特殊なパターンチェック
  if (/^\s+$/.test(title)) {
    errors.push('TODOタイトルは空白文字のみにはできません。');
  }
  
  // SQLインジェクション対策（基本的なパターン）
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*['"]/i,
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(title)) {
      errors.push('TODOタイトルに不正な文字列が含まれています。');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedTitle: sanitized,
    errors,
  };
}

/**
 * XSS攻撃パターンの検出
 * @param input 検査対象の文字列
 * @returns XSS攻撃パターンが検出されたかどうか
 */
export function detectXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<form\b/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 包括的な入力検証とサニタイゼーション
 * @param input 検証対象の入力
 * @param maxLength 最大文字数
 * @returns 検証結果
 */
export function comprehensiveInputValidation(
  input: unknown,
  maxLength: number = 30
): {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  securityWarnings: string[];
} {
  const errors: string[] = [];
  const securityWarnings: string[] = [];
  let sanitizedValue = '';
  
  // 型チェック
  if (typeof input !== 'string') {
    errors.push('入力値は文字列である必要があります。');
    return { isValid: false, sanitizedValue, errors, securityWarnings };
  }
  
  // XSSパターン検出
  if (detectXSSPatterns(input)) {
    securityWarnings.push('XSS攻撃パターンが検出されました。');
    errors.push('不正な文字列が含まれています。');
  }
  
  // サニタイゼーション
  sanitizedValue = sanitizeString(input);
  
  // 基本バリデーション
  if (sanitizedValue.length === 0 && input.length > 0) {
    errors.push('無効な文字が含まれているため、入力を処理できません。');
  } else if (sanitizedValue.length === 0) {
    errors.push('入力は必須です。');
  } else if (sanitizedValue.length > maxLength) {
    errors.push(`入力は${maxLength}文字以内で入力してください。`);
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
    securityWarnings,
  };
}

/**
 * フォーム入力値のサニタイゼーション
 * @param formData フォームデータ
 * @returns サニタイズされたフォームデータ
 */
export function sanitizeFormData<T extends Record<string, any>>(formData: T): T {
  const sanitized = { ...formData };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    }
  }
  
  return sanitized;
}