export abstract class Helper {
  constructor() {}

  /**
   * This function will generate random tokens.
   * @param {*} length  Ex: length = 1 will create 10 characters token
   * @returns {*}
   */
  static randomTokens(length: number): string {
    let token = '';
    for (let i = 1; i <= length; i++) {
      token += Math.random().toString(36).substring(2);
    }
    return token;
  }

  /**
   * Sanitize file name.
   * @param {*} fileName  Ex: fileName = "test file.jpg" will create "test-file.jpg"
   * @returns {*}
   */
  static sanitizedFileName = (fileName: string): string => {
    const sanitizedFile = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '');
    return `${Date.now()}-${sanitizedFile}`;
  };
}
