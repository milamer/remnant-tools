import { ClientActionFunctionArgs } from '@remix-run/react';
import { z } from 'zod';
import { updateSelectedCharacterIdx } from '~/lib/db';

const actionSchema = z.object({
  characterIdx: z.coerce.number(),
});

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const data = actionSchema.parse(Object.fromEntries(formData));
  updateSelectedCharacterIdx(data.characterIdx);

  return null;
}
