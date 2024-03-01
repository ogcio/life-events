export function findParameters(text) {
  const regex = /{{(.*?)}}/g;
  let matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }

  return matches;
}
