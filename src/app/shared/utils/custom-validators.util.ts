import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PhoneMaskUtil } from './phone-mask.util';
import { DateMaskUtil } from './date-mask.util';

export class CustomValidators {
  /**
   * Validator para telefone
   * Valida se o telefone tem entre 10 e 11 dígitos
   */
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // required validator will handle empty values
      }

      const numbers = PhoneMaskUtil.removeMask(control.value);

      if (numbers.length < 10 || numbers.length > 11) {
        return { phone: { message: 'Telefone inválido' } };
      }

      return null;
    };
  }

  /**
   * Validator para data de nascimento
   * Valida se a data é válida e não é futura
   */
  static birthDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // required validator will handle empty values
      }

      const date = DateMaskUtil.parseDate(control.value);

      if (!date) {
        return { birthDate: { message: 'Data inválida' } };
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (date > today) {
        return { birthDate: { message: 'Não é permitido informar uma data futura' } };
      }

      return null;
    };
  }

  /**
   * Validator para email com mensagens customizadas
   */
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // required validator will handle empty values
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(control.value)) {
        return { email: { message: 'Informe um email válido' } };
      }

      return null;
    };
  }

  /**
   * Validator customizado para required com mensagem personalizada
   */
  static required(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.toString().trim() === '') {
        return { required: { message: `${fieldName} é obrigatório` } };
      }
      return null;
    };
  }

  /**
   * Validator para comparar horários
   * Valida se o horário início é menor que o horário fim
   */
  static timeRangeLessThan(startTimeField: string, endTimeField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.get(startTimeField)?.value;
      const endTime = control.get(endTimeField)?.value;

      if (!startTime || !endTime) {
        return null; // required validator will handle empty values
      }

      // Convert time strings to comparable format (HH:mm)
      const start = startTime.toString().padStart(5, '0');
      const end = endTime.toString().padStart(5, '0');

      if (start >= end) {
        return {
          timeRange: {
            message: 'A hora de término deve ser maior que a hora de início.'
          }
        };
      }

      return null;
    };
  }
}
