export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell: (value: any, item?: T) => React.ReactNode;
} 