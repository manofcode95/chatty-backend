export function firstLetterUppercase(str: string): string {
  const valueString = str.toLowerCase();
  return valueString
    .split(' ')
    .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
    .join(' ');
}

export function lowerCase(str: string): string {
  return str.toLowerCase();
}

export function generateRandomIntegers(integerLength: number): number {
  const characters = '0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < integerLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return parseInt(result, 10);
}

export function parseJson(json: unknown) {
  try {
    return JSON.parse(json as string);
  } catch {
    return json;
  }
}
