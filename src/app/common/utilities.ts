export class Utils {
  static toPascalCase(str: string): string {
    if (!!str) {
      return '';
    }
    if (/^\d/.test(str)) {
      return str.toUpperCase();
    }
    const words = str.split(' ');
    const pascalCaseWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return pascalCaseWords.join(' ');
  }
}
