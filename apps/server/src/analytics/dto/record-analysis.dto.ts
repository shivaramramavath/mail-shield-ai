export interface RecordAnalysisDto {
  label: 'spam' | 'ham';
  spamProbability: number;
  durationMs: number;
}
