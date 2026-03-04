'use client';
import { FormEvent } from 'react';
import { api } from '../../lib/api';

export default function RegisterPage(){
  const submit = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); await api('/auth/register',{method:'POST', body: JSON.stringify(Object.fromEntries(f.entries()))}); alert('Регистрация завершена'); };
  return <main className="container py-6"><h1 className="text-2xl">Регистрация</h1><form onSubmit={submit} className="grid gap-2 max-w-sm mt-4"><input name="email" placeholder="email" className="border p-2"/><input name="password" type="password" placeholder="password" className="border p-2"/><button className="bg-blue-600 text-white py-2">Создать аккаунт</button></form></main>;
}
