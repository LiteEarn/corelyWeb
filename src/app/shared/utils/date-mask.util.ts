export class DateMaskUtil {
  /**
   * Aplica máscara de data em tempo real
   * @param value - valor do input
   * @returns valor formatado DD/MM/YYYY
   */
  static applyMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    } else {
      return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    }
  }

  /**
   * Remove máscara e retorna apenas números
   * @param value - valor formatado
   * @returns apenas números
   */
  static removeMask(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }

  /**
   * Converte string DD/MM/YYYY para Date
   * @param value - data formatada DD/MM/YYYY
   * @returns Date object ou null se inválida
   */
  static parseDate(value: string): Date | null {
    if (!value) return null;

    const numbers = this.removeMask(value);
    if (numbers.length !== 8) return null;

    const day = parseInt(numbers.substring(0, 2), 10);
    const month = parseInt(numbers.substring(2, 4), 10);
    const year = parseInt(numbers.substring(4, 8), 10);

    const date = new Date(year, month - 1, day);

    // Verifica se a data é válida
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
      return null;
    }

    return date;
  }

  /**
   * Converte Date para string DD/MM/YYYY
   * @param date - Date object
   * @returns string formatada DD/MM/YYYY
   */
  static formatDate(date: Date): string {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  }

  /**
   * Valida se a data é válida e não é futura
   * @param value - valor a ser validado
   * @returns true se válido
   */
  static isValid(value: string): boolean {
    const date = this.parseDate(value);
    if (!date) return false;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final do dia atual

    return date <= today;
  }

  /**
   * Retorna mensagem de erro para data inválida
   * @param value - valor a ser validado
   * @returns mensagem de erro ou null se válido
   */
  static getErrorMessage(value: string): string | null {
    if (!value) return 'Data de nascimento é obrigatória';

    const date = this.parseDate(value);
    if (!date) return 'Data inválida';

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      return 'Não é permitido informar uma data futura';
    }

    return null;
  }
}
