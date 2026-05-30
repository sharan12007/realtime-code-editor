const palette = ['#E11D48', '#2563EB', '#16A34A', '#CA8A04', '#7C3AED', '#DB2777', '#0891B2', '#EA580C'];

export const colorFromUserId = (userId: string): string => {
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length] ?? '#2563EB';
};
