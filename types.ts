export enum ContentType {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  TABLE = 'table'
}

export interface DocElement {
  type: ContentType;
  text?: string;
  level?: number; // For headings (1, 2, 3)
  align?: 'left' | 'center' | 'right' | 'justify';
  isBold?: boolean;
  rows?: string[][]; // For tables: simple text 2D array
}

export interface ConversionResponse {
  elements: DocElement[];
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';
  message?: string;
}
