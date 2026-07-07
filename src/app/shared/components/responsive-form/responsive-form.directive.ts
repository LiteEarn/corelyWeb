import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appScrollToFirstError]',
  standalone: true
})
export class ScrollToFirstErrorDirective {
  private el = inject(ElementRef);

  scrollToFirstError(): void {
    const form = this.el.nativeElement as HTMLElement;
    const firstError = form.querySelector('.mat-mdc-form-field.ng-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = firstError.querySelector('input, select, textarea, [matInput]');
      if (input instanceof HTMLElement) {
        input.focus();
      }
    }
  }
}
