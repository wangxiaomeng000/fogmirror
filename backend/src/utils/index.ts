export const generateLayerColor = (type: 'facts' | 'insights' | 'concepts'): string => {
  const colors = {
    facts: '#4A90E2',     // 蓝色
    insights: '#F5A623',  // 金色
    concepts: '#E85D75'   // 红色
  };
  return colors[type];
};

export const calculateDistance = (
  pos1: [number, number, number],
  pos2: [number, number, number]
): number => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const normalizeVector = (
  vector: [number, number, number]
): [number, number, number] => {
  const magnitude = Math.sqrt(
    vector[0] * vector[0] +
    vector[1] * vector[1] +
    vector[2] * vector[2]
  );
  
  if (magnitude === 0) return [0, 0, 0];
  
  return [
    vector[0] / magnitude,
    vector[1] / magnitude,
    vector[2] / magnitude
  ];
};

export const interpolatePosition = (
  start: [number, number, number],
  end: [number, number, number],
  t: number
): [number, number, number] => {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
    start[2] + (end[2] - start[2]) * t
  ];
};

export const sanitizeBase64 = (base64String: string): string => {
  // 移除data:image/xxx;base64, 前缀
  const base64Prefix = /^data:image\/\w+;base64,/;
  return base64String.replace(base64Prefix, '');
};