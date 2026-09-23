import { redirect } from 'next/navigation'; export default async function Page({params}:{params:Promise<{eventoId:string}>}){const {eventoId}=await params;redirect(`/eventos/${eventoId}/dashboard`)}
