type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Input = ({ label, ...props }: Props) => (
  <label className="block text-sm">
    <span className="mb-1 block text-slate-300">{label}</span>
    <input
      {...props}
      className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-indigo-500 focus:ring"
    />
  </label>
);
