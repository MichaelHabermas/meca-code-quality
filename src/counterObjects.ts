import { FileContentRecord, FileCounterRecord, Issues, LinesRecord } from './types';

export const fileCounter: FileCounterRecord = {
  '.js': 0,
  '.jsx': 0,
  '.ts': 0,
  '.tsx': 0,
  '.md': 0,
  '.css': 0,
  '.scss': 0,
  '.sass': 0,
  '.less': 0,
  '.py': 0,
  'other_style_files': 0
}

export const filesLinesCounter: LinesRecord = {
  js_lines: 0,
  ts_lines: 0,
  css_lines: 0,
  other_style_lines: 0
}

export const filesContentCounter: FileContentRecord = {
  '!important': 0,
  '= useRef': 0,
  'style={': 0,
  'margin:': 0,
  '.subscribe(': 0,
}

export const problemIssues: Issues = {
  strict_mode: 0,
  // styleLint: 0
}

export const fileCounterKeys = Object.keys(fileCounter);

export const ROOT_DIR = '.';