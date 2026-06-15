export class PhoneMaskUtil {
  /**
   * Aplica máscara de telefone em tempo real
   * @param value - valor do input
   * @returns valor formatado
   */
  static applyMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica máscara baseada no tamanho
    if (numbers.length <= 10) {
      // Telefone fixo: (11) 3333-4444
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      // Celular: (11) 99999-9999
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
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
   * Valida se o telefone tem formato correto
   * @param value - valor a ser validado (apenas números)
   * @returns true se válido
   */
  static isValid(value: string): boolean {
    const numbers = this.removeMask(value);
    return numbers.length >= 10 && numbers.length <= 11;
  }

  /**
   * Retorna mensagem de erro para telefone inválido
   * @param value - valor a ser validado
   * @returns mensagem de erro ou null se válido
   */
  static getErrorMessage(value: string): string | null {
    if (!value) return 'Telefone é obrigatório';

    const numbers = this.removeMask(value);
    if (numbers.length < 10 || numbers.length > 11) {
      return 'Telefone inválido';
    }

    return null;
  }
}
