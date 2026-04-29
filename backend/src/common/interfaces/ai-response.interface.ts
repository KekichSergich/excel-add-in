export interface AIResponse {
  type: 'action' | 'analysis';
  tool?: string;
  params?: Record<string, unknown>; // { cell: 'E1', formula: '=SUM(B2:B10)' } тайпскрипт знает о ключе. можно обратиться params['cell']
  message: string;
}
