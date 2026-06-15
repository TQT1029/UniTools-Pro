/**
 * UniTools Platform Types & Config Schemas
 */

export type TabId =
  | 'math-cas'
  | 'math-type'
  | 'count-word'
  | 'text-transform'
  | 'converter'
  | 'adv-tools'
  | 'video-speed'
  | 'coc-builder'
  | 'date-calc'
  | 'finance-calc'
  | 'pomodoro';

export interface TabConfig {
  id: TabId;
  name: string;
  icon: string;
  category: 'toán học' | 'năng suất' | 'tiện ích' | 'tài chính';
  description: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

// 1. Math CAS types
export interface MathFunction {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
}

// 2. MathType types
export interface MathTypeSymbol {
  id: string;
  display: string;
  latex: string;
  category: string;
  tags: string[];
}

export interface StructuralTemplate {
  type: string;
  name: string;
  htmlTemplate: string;
  latexBuilder: (slots: Record<string, string>) => string;
}

// 3. CountWord types
export interface CountWordResult {
  duration: number;
  charCountTotal: number;
  charCountNoSpaces: number;
  lineCountTotal: number;
  emptyLines: number;
  nonEmptyLines: number;
  paragraphCount: number;
  wordCountTotal: number;
  uniqueWordsCount: number;
  repeatedWordsCount: number;
  sentenceCount: number;
  langDetected: string;
  longestWord: string;
  shortestWord: string;
  avgWordLength: number;
  lengthDistribution: Record<string, number>;
  wordFreqMap: Record<string, number>;
  charFreqMap: Record<string, number>;
  bigrams: [string, number][];
  trigrams: [string, number][];
  quadgrams: [string, number][];
  stopWordMatchCount: number;
  struct: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    listCount: number;
    tableCount: number;
    linkCount: number;
    imgCount: number;
  };
  duplicateCount: number;
  duplicateSample: string;
}

// 4. Text Transformer types
export type TextTransformationType =
  | 'remove_exact'
  | 'remove_multiple'
  | 'remove_chars'
  | 'remove_pattern_range'
  | 'remove_domain_ext'
  | 'remove_line_match'
  | 'remove_paragraph_match'
  | 'remove_regex'
  | 'replace_find_target'
  | 'replace_batch'
  | 'replace_regex'
  | 'split_fullname'
  | 'split_email'
  | 'split_url'
  | 'split_custom'
  | 'extract_emails'
  | 'extract_phones'
  | 'extract_urls'
  | 'extract_hashtags_mentions'
  | 'normalize_spaces'
  | 'normalize_vietnamese'
  | 'case_upper'
  | 'case_lower'
  | 'case_camel'
  | 'case_snake'
  | 'case_kebab';

export interface TransformationRule {
  id: string;
  enabled: boolean;
  type: TextTransformationType;
  value1: string;
  value2: string;
}

export interface RuleDefinition {
  name: string;
  category: 'remove' | 'replace' | 'split' | 'extract' | 'normalize' | 'case';
  dualInput?: boolean;
  flag?: boolean;
  placeholder?: string;
  placeholder1?: string;
  placeholder2?: string;
}

// 5. Universal Converter types
export interface UnitConverterCategory {
  group: string;
  type: 'linear' | 'temperature';
  units: Record<string, number> | string[];
}

// 6. Advanced Tools schemas
export interface ToolInputSchema {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  label?: string;
  placeholder?: string;
  value?: string | number | boolean;
  options?: Record<string, string>;
}

export interface ToolActionSchema {
  name: string;
  icon: string;
  run: (inputs: Record<string, any>) => string | Promise<string>;
}

export interface AdvancedTool {
  name: string;
  inputs: ToolInputSchema[];
  actions: ToolActionSchema[];
}

export interface AdvancedToolGroup {
  name: string;
  icon: string;
  tools: Record<string, AdvancedTool>;
}

// 7. Clash of Clans Builder types
export interface CocPotion {
  name: string;
  multiplier: number;
  duration: number; // in hours
}
