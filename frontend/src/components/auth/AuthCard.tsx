type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const AuthCard = ({ title, subtitle, children }: Props) => (
  <div className="mx-auto mt-16 w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
    <h1 className="text-2xl font-semibold">{title}</h1>
    {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    <div className="mt-6">{children}</div>
  </div>
);
