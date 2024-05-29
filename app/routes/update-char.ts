import { ClientActionFunctionArgs } from '@remix-run/react';
import { z } from 'zod';
import { updateCharacters } from '~/lib/db';

const NonEmptyFile = z.instanceof(File).refine(
  (file) => Boolean(file) && file.size > 0,
  () => ({ message: `File is empty` }),
);
const actionSchema = z.object({
  saveFile: NonEmptyFile,
});

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const url = new URL(document.location.href);

  if (url.searchParams.has('upload')) {
    const formData = await request.formData();
    const data = actionSchema.parse(Object.fromEntries(formData));

    await updateCharacters(data.saveFile);

    url.searchParams.delete('upload');
    return new Response(null, {
      headers: { Location: url.toString() },
      status: 303,
    });
  }

  return new Response(null, {
    headers: { Location: '/' },
    status: 303,
  });
}
