export interface IMessage {
  ruleId: number;
  severity: number;
  line: number;
  column: number;
  message: string;
}

export interface IFile {
  messages: IMessage[];
  filePath: string;
}

export type LinesRecord =  Record<'js_lines' | 'ts_lines' | 'css_lines' | 'other_style_lines', number>;
export type FileCounterRecord =  Record<'.js' | '.jsx' | '.ts' | '.tsx' | '.md' | '.css' | '.scss' | '.sass' | '.less' | '.py' | 'other_style_files', number>;
export type FileContentRecord =  Record<'!important' | '= useRef' | 'style={' | 'margin:' | '.subscribe(', number>;
export type Issues =  Record<'strict_mode', number>; // TODO: 'styleLint'

export interface ICounter {
  fileCounter: FileCounterRecord;
  filesLinesCounter: LinesRecord;
  filesContentCounter: FileContentRecord;
  problemIssues: Issues;
}