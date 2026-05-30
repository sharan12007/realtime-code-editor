import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const AuthCard = ({ title, subtitle, children }: Props) => (
  <Card className="mx-auto mt-16 w-full max-w-md border-zinc-800/80">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
