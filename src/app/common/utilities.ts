import { CSS_COLORS } from '../app.constants';

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

  static findCSSColorName(text: string): string {
    const regex = new RegExp(`\\b(${CSS_COLORS.join('|')})\\b`, 'gi');
    const match = text.match(regex);
    return match ? match[0] : 'white';
  }
}
