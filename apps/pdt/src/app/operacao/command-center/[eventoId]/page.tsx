import { redirect } from 'next/navigation';

export default async function CommandCenterAliasPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const { eventoId } = await params;
  redirect(`/eventos/${eventoId}/command-center`);
}
