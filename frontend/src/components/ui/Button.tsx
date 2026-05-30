type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export const Button = ({ loading, children, className = '', ...props }: Props) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 ${className}`}
  >
    {loading ? 'Please wait...' : children}
  </button>
);
