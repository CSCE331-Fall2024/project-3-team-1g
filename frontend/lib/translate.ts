import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({ key: process.env.GOOGLE_CLOUD_API_KEY });

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}
