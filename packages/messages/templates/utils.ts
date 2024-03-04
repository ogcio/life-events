export function findParameters(text: string): string[] {
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

export function buildMessage(
  template: string,
  params: Record<string, any>
): string {
  const requiredParams = findParameters(template);
  const missingParams = requiredParams.filter(
    (param) => !params.hasOwnProperty(param)
  );

  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
  }

  const regex = /{{(.*?)}}/g;

  return template.replace(regex, (match, key) => {
    if (params.hasOwnProperty(key)) {
      return params[key];
    }
    return match;
  });
}
