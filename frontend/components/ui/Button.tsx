export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: any) {
  const base = 'rounded-lg font-medium transition-colors';
  const variants: any = { primary: 'bg-blue-600 text-white hover:bg-blue-700', success: 'bg-green-600 text-white hover:bg-green-700', danger: 'bg-red-600 text-white hover:bg-red-700', outline: 'border border-gray-300 hover:bg-gray-50' };
  const sizes: any = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  return <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>{children}</button>;
}
