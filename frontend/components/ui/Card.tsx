export function Card({ children, className = '' }: any) {
  return <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>{children}</div>;
}
